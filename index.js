const express = require('express');
const nconf = require('nconf');
const helmet = require('helmet');
const compression = require('compression');
const moment = require('moment');
const fse = require('fs-extra');

const PORT = process.env.PORT || '3000';
const confPath = './config.json'

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

const initProducts = () => {

    nconf.use('file', { file: confPath });
    nconf.load();

    const dt = moment().clone()
    const strDate = dt.toISOString()

    console.log('str date', strDate)

    for (let i = 0; i < baseData.length; i++) {
        const prodObj = baseData[i];
        const prodKey = `prod${i}`;

        nconf.set(`${prodKey}:date_creation`, strDate);

        for (const key in prodObj) {
            if (prodObj.hasOwnProperty(key)) {
                const element = prodObj[key];
                
                nconf.set(`${prodKey}:${key}`, element);
            }
        }

        
    }

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

app.get('/init', (req,res) => {

    return initProducts()
    .then(() => {
        res.status(200).send('Products initialized').end()
    })
    .catch(err => {
        res.status(400).send(err.message).end()
    })

})

const getConf = () => {
    return new Promise((res,rej) => {
        try {
            return fse.readFile(confPath, (err,data) => {
                if (err){
                    return rej(err)
                } else {
                    console.dir(JSON.parse(data.toString()))
                    return res(JSON.parse(data.toString()))
                }
                 
            })
        } catch (error) {
            return rej(error)
        }

    })
}

app.get('/CRON_DAILY', (req,res) => {

     return getConf()
     .then(data => {
        console.dir('data',data)
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
