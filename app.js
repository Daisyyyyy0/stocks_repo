const express = require('express')
const app = express()
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')

const db = require('./models')
const Stock = db.Stock
// console.log('typeof db:', typeof (db), 'db:', db);
// console.log('typeof Stock:', typeof (Stock), 'Stock:', Stock,);
const port = 3001

app.engine('.hbs', engine({ extname: '.hbs' }));  //前者是express的function,後者是express-handlebars的設定
app.set('view engine', '.hbs'); //將副檔名.hbs的檔案視做template
app.set('views', './views');  //將views做為template存放的位置
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))  //讓每一筆路由都會透過 method-override 進行前置處理，透過query string使用的欄位名稱作為辨別

app.get('/', (req, res) => {
    console.log('連線成功');
    res.render('index')
})


app.get('/stocks', (req, res) => {
    return Stock.findAll({
        attributes: ['id', 'stockName', 'stock_number', 'price'],
        raw: true
    })
        .then((stocksss) => res.render('stocks', { stocks: stocksss }))  //前者:stocks要跟前端stocks.hbs中的迴圈名稱一樣  //這行也可以簡寫成 { stocks }
        .catch((err) => {
            console.log('erorrrrrr');
            res.status(422).json(err)
        })
})

app.get('/stocks/new', (req, res) => {
    res.render('new')
})

app.post('/stocks', (req, res) => {
    const stockName = req.body.stockName
    const stock_number = req.body.stock_number
    const price = req.body.price
    return Stock.create({ stockName, stock_number, price })      //Q:無法新增 A:要將not null的值放入create中
        .then(() => res.redirect('/stocks'))
        .catch((err) => console.log(err))
})

app.get('/stocks/:stock_number', (req, res) => {
    const params = req.params
    const stock_number = req.params.stock_number
    console.log('params:', params);  //為什麼這裡印出來的params只有2330而且抓不到id?

    TODO:
    //將stock_number改成id
    return Stock.findOne({                     //無法顯示資料
        where: { stock_number: stock_number },   //前者:資料庫的欄位名稱, 後者:那一格value
        raw: true
    })
        .then((stock) => res.render('stock', { stock }))    //抓取了所有欄位的資料
        .catch((err) => {
            console.log('erorrrrrr');
            res.status(422).json(err)
        })
})

app.get('/stocks/:id/edit', (req, res) => {
    const id = req.params.id
    return Stock.findByPk(id, {  //在渲染表單之前，取得編輯對象的stock內容
        attributes: ['id', 'stockName', 'stock_number', 'price'],
        raw: true
    })
        .then((stock) => res.render('edit', { stock }))
        .catch((err) => {
            console.log('erorrrrrr');
            res.status(422).json(err)
        })
})

app.put('/stocks/:id', (req, res) => {
    const reqBody = req.body
    const id = req.params.id
    console.log('reqBody:', reqBody);
    console.log("params:", req.params);
    return Stock.update({ stockName: reqBody.stockName }, { whrer: { id } })
        .then(() => { res.redirect(`/stocks/:${reqbody.stock_number}`) })
    // res.send(`stock id: ${req.params.id} has been modifyied`)
})

app.delete('/stocks/:id', (req, res) => {
    res.send('delete stock')
})

app.listen(port, () => {
    console.log(`App is running on ${port}`);
})