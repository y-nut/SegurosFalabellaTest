/**
 * ########## APP INSTRUCTIONS ###########
 * The app below is created based on the README file in the root of this project.
 * It consists of a product list of fictive insurances with various information, such as
 * name, price, sellIn and creation date. The SellIn attribute indicates how many days
 * a product has been for sale. 
 * 
 * The SellIn value is dynamically adjusted as the days go by with a CRON named "/v1/CRON_DAILY".
 * This CRON function should be executed every 24 hours. For instance at 23.59 all days.
 * 
 * The price list is initialized the first day with the endpoint "/v1/init"
 * 
 * The remaining endpoints and functions have their own description based on the README. 
 * Please see through code.
 * 
 */

const express = require('express');
const nconf = require('nconf');
const helmet = require('helmet');
const compression = require('compression');
const moment = require('moment');
const fse = require('fs-extra');
const UUID = require('uuid/v4');

const PORT = process.env.PORT || '3000';
const for_sale_list = './for_sale_list.json';
const sold_list = './sold.json';

const baseData = [
    {
        name: 'Cobertura',
        sellIn: 10,
        price: 20
    },
    {
        name: 'Full cobertura',
        sellIn: 2,
        price: 0
    },
    {
        name: 'Baja cobertura',
        sellIn: 5,
        price: 7
    },
    {
        name: 'Mega cobertura',
        sellIn: 0,
        price: 80
    },
    {
        name: 'Mega cobertura',
        sellIn: -1,
        price: 80
    },
    {
        name: 'Full cobertura super duper',
        sellIn: 15,
        price: 20
    },
    {
        name: 'Full cobertura super duper',
        sellIn: 10,
        price: 49
    },
    {
        name: 'Full cobertura super duper',
        sellIn: 5,
        price: 49
    },
    {
        name: 'Super avance',
        sellIn: 3,
        price: 6
    },
]

const app = express();
app
.use(helmet())
.use(compression())

const getNowStr = () => {
    const dt = moment().clone()
    return dt.toISOString();
}

const setConf = (arr_data, include_creation_data) => {

    nconf.use('file', { file: for_sale_list })
    nconf.load();
/*
    const dt = moment().clone()
    .set({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
    })
    */
    const strDate = getNowStr(); // dt.toISOString();

    for (let i = 0; i < arr_data.length; i++) {
        let prodObj = arr_data[i];
        const prodKey = UUID() //`prod${i}`;

        if (include_creation_data){
            nconf.set(`${prodKey}:date_creation`, strDate);
        }

        for (const key in prodObj) {
            if (prodObj.hasOwnProperty(key)) {
                const element = prodObj[key];
                nconf.set(`${prodKey}:${key}`, element);  
            }
        }

        
    }

    return saveList(nconf)

}

const saveList = (nconf) => {
    return new Promise((res,rej) => {
        try {
            return  nconf
            .save( (err) => {
                if (err) {
                  return rej(err)
                } else {
                    return res()
                }
                
            });
        } catch (error) {
            return rej(error)
        }

    })
}

const initProducts = () => {

    return setConf(baseData,true)
}

const getList = (listName) => {
    return new Promise((res,rej) => {
        try {
            return fse.readFile(listName, (err,data) => {
                if (err){
                    return rej(err)
                } else {
                    const _data = JSON.parse(data.toString())
                    return res(_data)
                }
                 
            })
        } catch (error) {
            return rej(error)
        }

    })
}

const product_rules = (data) => {
    
    return new Promise((res,rej) => {

        try {
            const arr = []

            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    let prodObj = data[key];

                    if (!prodObj.sold){
                    
                        let todayVirtual = moment().clone()
                        //todayVirtual =  moment().clone().add({days: 4}); //test
                        const moment_creation = moment(prodObj.date_creation).clone()
                        const diffDays = todayVirtual.diff(moment_creation, 'days', false);
                        console.log('diffDays', diffDays)
        
                        //todos los productos tienen un valor de sellIn, que indica la cantidad de dias que tenemos para vender ese producto.
                        prodObj.sellIn -= diffDays;
    
    
                        switch(prodObj.name){
                            case 'Full cobertura':
                                //el producto "Full cobertura" incrementa su precio a medida que pasa el tiempo.
                                prodObj.price -= diffDays
                                break;
                            case 'Mega cobertura':
                                //el producto "Mega cobertura", nunca vence para vender y nunca disminuye su precio.
                                //el producto "Mega cobertura" tiene un precio fijo de 180.
                                prodObj.sellIn += diffDays;
                                prodObj.price = 180
                                break;
                            case 'Full cobertura Super duper':
                                /**
                                 * el producto "Full cobertura Super duper", tal como el "Full Cobertura", incrementa su precio a medida que se acerca su fecha de vencimiento:
                                    - El precio se incrementa en 2 cuando quedan 10 dias o menos y se incrementa en 3, cuando quedan 5 dias o menos.
                                    - el precio disminuye a 0 cuando se vence el tiempo de venta.
                                 */
                                if (diffDays <= 10 && diffDays > 5){
                                    prodObj.price -= 2 
                                } else if (diffDays > 0 && diffDays <= 5){
                                    prodObj.price -= 3
                                } else if (diffDays < 1){
                                    prodObj.price = 0
                                }
                                break;
                            case 'Super avance':
                                //El producto "Super avance" dismuniye su precio el doble de rapido que un producto normal
                                prodObj.sellIn -= 2;
                                break;
                            default:
                                //Al final del dia, el sistema debe disminuir los valores de price y sellIn para cada producto.
                                //Una vez que la fecha de venta ha pasado, sellIn < 0 , los precios de cada producto, se degradan el doble de rapido.
                                prodObj.price -= prodObj.sellIn < 0 ? 1 : 2;
                                
                                
                                break;
                        }
    
                        //El precio de un producto, nunca es negativo
                        //el precio de un producto nunca supera los 100.
                        prodObj.price = prodObj.price < 0 ? 0 : prodObj.price > 100 ? 100 : prodObj.price;
                        
        
                        const nProdObj = Object.assign({}, prodObj)
                        arr.push(nProdObj)    
                    }
                    
                }
            }
    
            return res(arr)
        } catch (error) {
            return rej(error)
        }


    })


}

app.get('/v1/init', (req,res) => {

    return initProducts(baseData)
    .then(() => {
        res.status(200).send('Products initialized').end()
    })
    .catch(err => {
        res.status(400).send(err.message).end()
    })

})

app.get('/v1/CRON_DAILY', (req,res) => {

     return getList(for_sale_list)
     .then(data => {
        //console.log('data 1',data)
        return product_rules(data)
        //return res.status(200).send('OK').end()
     })
     .then((nData) => {
        return setConf(nData,false)
        //return res.status(200).send('OK').end()
     })
     .then(() => {
         console.log('updated file')
         return res.status(200).send('OK').end()
     })
     .catch(er => {
        return res.status(400).send(er.message).end()
     })

    
})


app.get('/v1/sell-product', (req, res) => {

    /**
     * vender un producto de los tipos definidos (for_sale_list.json)
     *  - Agregas a productos vendidos uno de los productos que tenemos (sold.json)
     */

    const prodKey = req.query.key;

    if (prodKey){

        return getList(for_sale_list)
        .then(products => {
            
            if (products && products[prodKey]){
                let product = products[prodKey];

                if (product.sold){
                    return res.status(400).send('product is sold!').end()
                } else {
                    
                    
                    try {
                        
                        product.sold = true;
                        product.sold_date = getNowStr();

                        const startMoment = moment(product.date_creation).clone();
                        const endMoment = moment(product.sold_date).clone();
                        const diffDays = endMoment.diff(startMoment, 'days', false);

                        product.days_between_creation_date_and_selling_date = diffDays

                        const updateSaleList = nconf.use('file', { file: for_sale_list });
                        updateSaleList.load();

                        updateSaleList.set(`${prodKey}`, product);

                        if (product.name === 'Mega cobertura'){
                            //Tienes el producto Mega cobertura, al momento de vender uno de ese tipo, nuestra lista de productos vendidos agrega uno nuevo.
                            const newProduct = {
                                "date_creation": getNowStr(),
                                "name": "Mega cobertura",
                                "sellIn": 15,
                                "price": 80
                              }
                            const newID = UUID();

                            updateSaleList.set(`${newID}`, newProduct);
                        }

                        return saveList(updateSaleList)
                        .then(() => {
                            const addToSoldList = nconf.use('file', { file: sold_list });
                            addToSoldList.load();
    
                            addToSoldList.set(prodKey, product);

                            /*

                            I don't understand this instruction?????

                            Puedes crear los productos programaticamente dentro del código, pero debes permitir crear un producto de esos tipos, ej:

                                
                                Vendes el mismo anterior.
                                Vendes el producto Cobertura, que es un producto normal, se agrega a la lista.
                                Vendes un super avance y lo mismo.
                                La lista de productos vendidos, quedaria asi:
                                    Mega cobertura
                                    Mega cobertura
                                    Cobertura
                                    Super avance


                             */

                            return saveList(addToSoldList)

                        })
                        .then(() => {
                            return res.status(200).json({
                                result: 'You bought the product',
                                product: product
                            })
                        })
                        .catch(er => {
                            return res.status(400).send('An error happened').end()
                        })

                        
                    } catch (error) {
                        return res.status(400).send('Could not update list!').end()
                    }

                }

    

            } else {
                return res.status(400).send('No products!').end()
            }
            
        })
        .catch(er => {
            return res.status(400).send(er.message).end()
        })


    } else {
        return res.status(400).send('No product defined!').end()
    }

})

app.get('/v1/show-sold-products', (req, res) => {
    /**
     * listar los productos que tenemos en venta
        Muestras la lista de productos vendidos que tenemos actualmente.

        listar comportamiento de todos los productos vendidos en X cantidad de dias (simulación) (*)

    La idea de este endpoint es mostrar como varia cada producto al pasar los dias. (Más adelante se muestran algunos ejemplos)

    */

    return getList(sold_list)
    .then(data => {
        return res.status(200).send(data).end()
    })
    .catch(er => {
        return res.status(400).send(er.message).end()
    })
})




const server = app.listen(PORT || '3000', () => {
    console.log(`app listening on port ${server.address().port}`);
})




/**
 * Instructions
 * 1. Create dockerfile
 * 2. POSTMAN file
 */
