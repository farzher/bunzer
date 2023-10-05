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
                // Crear un nuevo nodo para el par clave-valor
                Node *newNode = (Node *)malloc(sizeof(Node));
                if (newNode != NULL)
                {
                    strcpy(newNode->keyValue.key, key);
                    strcpy(newNode->keyValue.value, value);
                    newNode->next = NULL;

                    // Agregar el nuevo nodo a la lista
                    if (queryParams.head == NULL)
                    {
                        queryParams.head = newNode;
                    }
                    else
                    {
                        Node *currentNode = queryParams.head;
                        while (currentNode->next != NULL)
                        {
                            currentNode = currentNode->next;
                        }
                        currentNode->next = newNode;
                    }
                }
            }
        }

        token = strtok(NULL, "&");
    }

    // Construir la cadena resultante
    Node *currentNode = queryParams.head;
    while (currentNode != NULL)
    {
        if (result == NULL)
        {
            result = strdup("{");
        }
        else
        {
            result = realloc(result, strlen(result) + 3); // +3 para "{, "
            strcat(result, ", ");
        }
        char keyValue[256]; // Tamaño suficiente para almacenar "{key: 'value'}"
        snprintf(keyValue, sizeof(keyValue), "\"%s\": \"%s\"", currentNode->keyValue.key, currentNode->keyValue.value);
        result = realloc(result, strlen(result) + strlen(keyValue) + 1); // +1 para el carácter nulo
        strcat(result, keyValue);
        currentNode = currentNode->next;
    }

    // Agregar el corchete de cierre "}"
    if (result != NULL)
    {
        result = realloc(result, strlen(result) + 2); // +2 para "} y \0"
        strcat(result, "}");
    }

    // Liberar la memoria de los nodos de la lista enlazada
    currentNode = queryParams.head;
    while (currentNode != NULL)
    {
        Node *nextNode = currentNode->next;
        free(currentNode);
        currentNode = nextNode;
    }

    return result;
}


char *getKey(char *json, char *key)
{
    const char *start = strstr(json, key);

    if (start == NULL)
    {
        return NULL;
    }

    start += strlen(key) + 3;

    const char *end = strchr(start, '"');

    if (end == NULL)
    {
        return NULL;
    }

    // Calcula la longitud del valor
    size_t leng = end - start;

    // Copia el valor a una cadena nueva
    char *value = malloc(leng + 1);
    strncpy(value, start, leng);
    value[leng] = '\0';

    return value;
}

int main()
{
    char queryString[] = "year=2023&month=october&param1=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iO.nRydWUsImlhdCI6MTY5NjU0MDkxNywiZXhwIjoxNjk2NTQ0NTE3fQ";
    char *parsedValues = parseQueryString(queryString);
    printf("%s", parsedValues);


    char *year = getKey(parsedValues, "\"param1\"");

    if (year != NULL)
    {
        printf("Year: %s\n", year);
        free(year);
        // free(parsedValues);
    }
    else
    {
        printf("Campo no encontrado\n");
    }

    free(parsedValues); 
    return 0;
}