# **Seguros Falabella**

## Test de entrevista

Bienvenido al test para el cargo de **Desarrollador de Software en Seguros Falabella**. En este test esperamos poder ver todo el conocimiento que tienes al momento de desarrollar software, ver cual es tu acercamiento a la solución y cuales buenas practicas manejas. **Por favor lee todo el enunciado antes de comenzar**.

Para ello te presentamos el problema a resolver a continuación:

- Como corredora de seguros que somos, tenemos en nuestra parrilla de productos, muchos de ellos, pero la gran mayoria se comporta de forma distinta y debemos verificar
como se comportan a traves del tiempo.

Tu misión es:
- Construir una API REST, de administrador de venta de productos, orientada a objetos.
  - La persistencia puede ser manejada en archivos de configuración.
  - Por cada producto, puedes manejarlo programaticamente si te es más facil, la orientación a objetos te ayudará a ello.
  - Debemos poder ser capaces de probar tu API, para ello te recomendamos que utilices un Dockerfile para que podamos levantarlo. 
  - En el mismo punto anterior, seria ideal contar una collección de POSTMAN para hacer pruebas o una documentación en Swagger.
  - Endpoints que esperamos:
    - vender un producto de los tipos definidos
      - Agregas a productos vendidos uno de los productos que tenemos
    - listar los productos que tenemos en venta
      - Muestras la lista de productos vendidos que tenemos actualmente.
    - listar comportamiento de todos los productos vendidos en X cantidad de dias (simulación) (*)
      - La idea de este endpoint es mostrar como varia cada producto al pasar los dias. (Más adelante se muestran algunos ejemplos)
- Cada producto tiene distintos comportamientos, las reglas de cada producto se determinan más abajo.
- No esperamos interfaz grafica, más allá de poder consumir la API por metodos tradicionales. (curl, postman, etc)


Reglas de productos:
- todos los productos tienen un valor de sellIn, que indica la cantidad de dias que tenemos para vender ese producto.
- todos los productos tienen un valor price que indica el costo del producto.
- Al final del dia, el sistema debe disminuir los valores de price y sellIn para cada producto.
- Una vez que la fecha de venta ha pasado, sellIn < 0 , los precios de cada producto, se degradan el doble de rapido.
- El precio de un producto, nunca es negativo.
- el producto "Full cobertura" incrementa su precio a medida que pasa el tiempo.
- el precio de un producto nunca supera los 100.
- el producto "Mega cobertura", nunca vence para vender y nunca disminuye su precio.
- el producto "Full cobertura Super duper", tal como el "Full Cobertura", incrementa su precio a medida que se acerca su fecha de vencimiento:
  - El precio se incrementa en 2 cuando quedan 10 dias o menos y se incrementa en 3, cuando quedan 5 dias o menos.
  - el precio disminuye a 0 cuando se vence el tiempo de venta.
- El producto "Super avance" dismuniye su precio el doble de rapido que un producto normal.
- el producto "Mega cobertura" tiene un precio fijo de 180.


## Notas
- Para el endpoint de variación (simulación) de productos (*), se espera algo similar a:  /evaluateProducts/{days}
  Donde days, es la cantidad de dias a evaluar y como resultado esperamos algo como, aqui es donde varia el sellIn y price, en función de los dias que se pidan:

  ```
    -------- dia 0 --------
    nombre, sellIn, price
    Cobertura, 10, 20
    Full cobertura, 2, 0
    Baja cobertura, 5, 7
    Mega cobertura, 0, 80
    Mega cobertura, -1, 80
    Full cobertura super duper, 15, 20
    Full cobertura super duper, 10, 49
    Full cobertura super duper, 5, 49
    Super avance, 3, 6
    -------- dia 1 --------
    nombre, sellIn, price
    Cobertura, 9, 19
    Full cobertura, 1, 0
    Baja cobertura, 4, 6
    Mega cobertura, -1, 80
    Mega cobertura, -2, 80
    Full cobertura super duper, 14, 19
    Full cobertura super duper, 9, 48
    Full cobertura super duper, 4, 48
    Super avance, 2, 5

    ...
  ```
- Puedes crear los productos programaticamente dentro del código, pero debes permitir crear un producto de esos tipos, ej:
    - Tienes el producto Mega cobertura, al momento de vender uno de ese tipo, nuestra lista de productos vendidos agrega uno nuevo.
    - Vendes el mismo anterior.
    - Vendes el producto Cobertura, que es un producto normal, se agrega a la lista.
    - Vendes un super avance y lo mismo.
    - La lista de productos vendidos, quedaria asi:
        - Mega cobertura
        - Mega cobertura
        - Cobertura
        - Super avance


## Reglas de evaluación
  - Esperamos una solución orientada a objetos
  - Esperamos que utilices buenas practicas para desarrollar.
  - La solución debe ser escalable, en cierto modo, debemos poder agregar nuevos tipos de productos en el futuro.
  - Vamos a leer la historia de los commits, para ver como llegaste a la solución, asi que debes hacer commit a medida que avanzas en el desarrollo, para ello  
    esperamos comentarios de commits, que sean significantes.
  - Para el desarrollo esperamos que trabajes con NodeJS >= 8 y que incluyas un Dockerfile con todas las dependencias para poder ejecutarlo.
  - Esperamos al menos un 100% de cobertura, del código que desarrolles (no aplica código de frameworks), deberas proveer el comando para ejecutar esta medición.
  - Debes proveer la documentación para utilizar tu API, puede ser un postman collection, swagger u otro.
  - Solo vamos a considerar tu solución, si nos envias tu propio repositorio con la solución propuesta.

