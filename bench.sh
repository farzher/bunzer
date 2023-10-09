bombardier --fasthttp -c 500 -d 10s http://127.0.0.1:8080/hello
# bombardier --fasthttp -c 500 -d 5s http://127.0.0.1:8080/query?token=bum
# bombardier --fasthttp -c 500 -d 10s -m POST -H 'Content-Type: application/json' -f ./scripts/body.json http://127.0.0.1:8080/json

