#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>

typedef struct
{
    char key[100];
    char value[100];
} KeyValue;

typedef struct Node
{
    KeyValue keyValue;
    struct Node *next;
} Node;

typedef struct
{
    Node *head;
} QueryParams;

void freeString(char *str)
{
    free(str);
}

char *parseQueryString(char *queryString)
{
    QueryParams queryParams;
    queryParams.head = NULL;
    char *result = NULL;
    size_t totalLength = 0; // Inicialmente, la longitud total es 0
    int isFirst = 1; // Indicador para determinar si es el primer elemento

    char *token = strtok(queryString, "&");
    while (token != NULL)
    {
        char *keyValue = token;
        char *equalSign = strchr(keyValue, '=');
        if (equalSign != NULL)
        {
            *equalSign = '\0';
            char *key = keyValue;
            char *value = equalSign + 1;

            if (key != NULL && value != NULL)
            {
                // Calcular la longitud necesaria para el nuevo fragmento
                size_t fragmentLength = strlen(key) + strlen(value) + 8; // 8 para las comillas y ": "

                // Realizar una asignación dinámica de memoria si es necesario
                if (result == NULL)
                {
                    result = (char *)malloc(fragmentLength + 3); // +3 para "{} y el carácter nulo
                    snprintf(result, fragmentLength + 3, "{\"%s\": \"%s\"", key, value);
                }
                else
                {
                    result = (char *)realloc(result, totalLength + fragmentLength + (isFirst ? 1 : 3)); // +3 para ",{}" o ", " y el carácter nulo
                    if (!isFirst) {
                        strcat(result, ", ");
                    }
                    strcat(result, "\"");
                    strcat(result, key);
                    strcat(result, "\": \"");
                    strcat(result, value);
                    strcat(result, "\"");
                }

                totalLength += fragmentLength + (isFirst ? 1 : 3);
                isFirst = 0; // Cambia el indicador después del primer elemento
            }
        }

        token = strtok(NULL, "&");
    }

    // Completar la cadena resultante con el corchete de cierre "}"
    if (result != NULL)
    {
        size_t resultLength = strlen(result);
        result = (char *)realloc(result, resultLength + 2); // +2 para "}" y el carácter nulo
        strcat(result, "}");
    }

    // Liberar la memoria de los nodos de la lista enlazada
    Node *currentNode = queryParams.head;
    while (currentNode != NULL)
    {
        Node *nextNode = currentNode->next;
        free(currentNode);
        currentNode = nextNode;
    }

    return result;
}

char* getKey(char* json, char* key) {

    char *key_ptr = strstr(json, key);
    if (key_ptr == NULL) {
        return NULL;
    }

    char *colon_ptr = strchr(key_ptr, ':');
    if (colon_ptr == NULL) {
        return NULL;
    }

    char *quote_ptr = strchr(colon_ptr, '\"');
    if (quote_ptr == NULL) {
        return NULL;
    }

    char *end_quote_ptr = strchr(quote_ptr + 1, '\"');
    if (end_quote_ptr == NULL) {
        return NULL;
    }

    char *output = malloc(end_quote_ptr - quote_ptr);
    strncpy(output, quote_ptr + 1, end_quote_ptr - quote_ptr - 1);
    output[end_quote_ptr - quote_ptr - 1] = '\0';

    return output;
}

// int main()
// {
//     char queryString[] = "year=2023&month=october&param1=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iO.nRydWUsImlhdCI6MTY5NjU0MDkxNywiZXhwIjoxNjk2NTQ0NTE3fQ";
//     char *parsedValues = parseQueryString(queryString);
//     printf("%s\n", parsedValues);

//     const char *year = getKey(parsedValues, "\"param1\"");

//     if (year != NULL)
//     {
//         printf("Year: %s\n", year);
//         free((void *)year);
//         // free(parsedValues);
//     }
//     else
//     {
//         printf("Campo no encontrado\n");
//     }

//     free(parsedValues);
//     return 0;
// }