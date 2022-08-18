const express=require('express')


const customer=require('./routes/customer');
const item=require('./routes/item');
const order=require('./routes/order');


const app=express();
const port=4000;

app.use(express.json())
app.use('/customer',customer);
app.use('/item',item);
app.use('/order',order);

app.listen(port,()=>{
    console.log(`app starting in ${port}`);
})