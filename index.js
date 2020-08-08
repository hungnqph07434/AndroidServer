let express = require('express');
let hbs = require('express-handlebars');
let bodyparser = require('body-parser')
let multer = require('multer');

let db = require('mongoose');
db.connect('mongodb+srv://admin:nhattien@cluster0-hpl1r.mongodb.net/database',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(()=> {
    console.log('Database connected');
})
    .catch((error)=> {
        console.log('Error connecting to database');
    });

//
let userSchema  = require('./model/userSchema');
let User = db.model('user',userSchema,'users');

let productsSchema = require('./model/productsSchema');
let Product = db.model('product',productsSchema,'products')

let billSchema = require('./model/billSchema');
let Bill = db.model('bill',billSchema,'bills');
//



let app = express();
app.use(bodyparser.urlencoded({extended : true}));
app.use(bodyparser.json());
app.use(express.static('css'));
app.use(express.static('fonts'));
app.use(express.static('vendor'));
app.use(express.static('uploads'));
app.engine('.hbs',
    hbs({
        extname:"hbs",
        defaultLayout:"",
        layoutDir:""
    }));

app.set('view engine','.hbs');

app.listen(2105);




app.get('/forumUser', async (req, res) => {
    let user = await User.find({}).lean();

    res.render('forum-users', {user: user});
});

app.get('/uploadProduct',async (req, res) => {
  let product = await Product.find({}).lean();

  res.render('forum-upload-product',{product:product});
});

app.get('/forumProducts', async (req,res) => {
    let product = await Product.find({}).lean();
    res.render('forum-product',{product:product});
});
app.get('/productManager', async (req,res) => {
    let product = await Product.find({}).lean();

    res.render('forum-product-manager',{product:product});
});




//update
app.get('/updateUser/:id',async (req, res) => {
    let id =  req.params.id;
    let user = await User.findById(id).lean();
    console.log(user)
    res.render('user-update', {user: user});
});

app.get('/updateProduct/:id',async (req, res) => {
    let id =  req.params.id;
    let product = await Product.findById(id).lean();

    res.render('update-product',{product:product});
});




app.get('/deleteUser/:id', async (req, res) => {
    let user = await User.findByIdAndDelete(req.params.id);
    res.redirect('/forumUser');
});
app.get('/deleteProduct/:id',async (req,res) => {
    let product = await Product.findByIdAndDelete(req.params.id);
    res.redirect('/productManager');
})









//Đăng nhập đăng kí
app.get('/',function (request,response) {
    response.render('login.hbs');
});

app.post('/login',async function (request,response) {
    let sm = request.body.sm;
    let username = request.body.a;
    let password = request.body.b;

    if(sm=='login'){
        let currentUser = await User.findOne({
            username: username,
            password: password,
        })
        if (currentUser==null){
            response.render('login',{isShow: true,alertMessage: 'Sai tài khoản hoặc mật khẩu'});
        }else {
            let product = await Product.find().lean();
            response.render('forum.hbs',{isShow: true,alertMessage: 'Đăng nhập thành công',product:product});
        }

    }else if(sm=='opensignup'){
        response.render('signup',{});
    }else if (sm='signup'){
        try {
            let user = new User({
                username: username,
                password: password
            })
            await user.save();
            response.render('login',{isShow: true,alertMessage: 'Đăng ki thành công'})

        }catch (e) {
            response.render('signup',{isShow: true,alertMessage: e.message});
        }
    }
});






//upload sản phẩm

let multerConfig = multer.diskStorage({
    destination : function (req, file,cb ) {
        cb(null, './uploads');
    },filename(req, file, cb) {

        cb(null,file.originalname);
    }
});

let uploadManyFiles = multer({storage: multerConfig,limits : {
        fileSize: 2 * 1024 * 1024,
        // files: 2

    },
    fileFilter:(req,file,cb)=>{
        const fileNameArr = file.originalname.split('.');
        const format = '.' + fileNameArr[fileNameArr.length - 1];
        switch (format) {
            case  '.jpg':
                cb(null,true);
                break;
            case  '.jpeg':
                cb(null,true);
                break;
            case  '.png':
                cb(null,true);
                break;
            default:
                cb(new Error(`File ${file.originalname} không đúng định dạng ảnh !!`),false);
                break;
        }

    }
}).single('image');


app.post('/upload', async (req, res) => {
                uploadManyFiles(req,res,async function (error) {
                    if (error) {
                        if (error instanceof multer.MulterError){
                            res.render('forum-upload-product',{isShow: true,alertMessage: 'Vượt quá số lượng file ảnh cho phép'})
                        }else {
                            res.render('forum-upload-product',{isShow: true,alertMessage: error.message})
                        }
                    }

                    else if (req.file.length <= 0){
                        res.render('forum-upload-product',{isShow: true,alertMessage: 'Bạn phải chọn 1 file hoặc nhiều hơn .'})
                    }
                    else {
                       try {
                           let name = req.body.nameProduct;
                           let price = req.body.priceProduct;
                           let specie = req.body.specieProduct;
                           let note = req.body.noteProduct;
                           let image = req.file.path.split('\\')[1];
                           await new Product({
                               name:name,
                               price:price,
                               image: './'+image,
                               specie:specie,
                               note:note
                           }).save();

                           console.log(image);
                           let product = await Product.find({}).lean();
                           res.render('forum-product',{isShow: true,alertMessage: 'Upload thành công',product: product})
                       }catch (e) {
                           let product = await Product.find({}).lean();
                           res.render('forum-product',{isShow: true,alertMessage: e.message,product: product})
                       }
                    }
                })
});


app.post('/xemsanpham', async (req, res) => {
    let id = req.body.id
    let product = await Product.findById(id).lean();
    console.log(product);
    res.render('product-detail',{product:product});
});






app.post('/updateUser', async (req, res) => {
    let id = req.body.idd;
    let username = req.body.nameuser;
    let password = req.body.passw;
    console.log(id+'/'+password+'/'+username)

  try {
       await User.findByIdAndUpdate(id,
          {
              username:username,
              password:password
          });
      let user = await User.find({}).lean();
      res.render('forum-users',{isShow: true,alertMessage:'Update thành công',user:user},);
  }
  catch (e) {
      res.render('user-update',{isShow: true,alertMessage:e.message});
  }

});



app.post('/updateProduct', async (req, res) => {
    uploadManyFiles(req,res,async function (error) {
        if (error) {
            if (error instanceof multer.MulterError){
                res.render('forum-upload-product',{isShow: true,alertMessage: 'Vượt quá số lượng file ảnh cho phép'})
            }else {
                res.render('forum-upload-product',{isShow: true,alertMessage: error.message})
            }
        }

        else {
            try {
                let id = req.body.idpro;
                let name = req.body.nameProductt;
                let price = req.body.priceProductt;
                let specie = req.body.specieProductt;
                let note = req.body.noteProductt;
                let image = req.file.path.split('\\')[1];
                await Product.findByIdAndUpdate(id,
                    {
                        name:name,
                        price:price,
                        image: './'+image,
                        specie:specie,
                        note:note
                    }
                    );
                console.log(name +'/' + price +'/' + specie +'/' + note +'/' + image)

                console.log(image);
                let product = await Product.find({}).lean();
                res.render('forum-product-manager',{isShow: true,alertMessage: 'Update thành công',product: product})
            }catch (e) {
                let product = await Product.find({}).lean();
                res.render('update-product',{isShow: true,alertMessage: e.message,product: product})
            }
        }
    })
});



//search
app.post('/searchNamePro',async (req, res) => {
  let search = req.body.searchs;
    let product = await Product.find({}).lean();
    let pro =[];
    for(var i=0; i<product.length; i++){
        if(product[i].name == search){
            pro.push(product[i]);
            res.render('forum-product',{product:pro});
            console.log(pro);
            return;
        }
    }
});










///////App react/////////////

app.get('/getAllUserApp',async (req, res) => {
    let user = await User.find({}).lean();

    res.send(user);
});

app.get('/getAllProductApp',async (req, res) => {
  let product = await Product.find({}).lean();
  res.send(product);
});

app.get('/getAllBillApp',async (req,res) => {
let bill = await Bill.find({}).lean();
res.send(bill);
})



app.post('/SignUpUserApp',async function (request,response) {
    let username = request.body.User;
    let password = request.body.Pass;
        try {
            let user = new User({
                username: username,
                password: password
            })
            await user.save();
        }catch (e) {
        }
});



app.post('/loginApp',async function (request,response) {
    let username = request.body.User;
    let password = request.body.Pass;

    console.log(username + '/'+password);
    try {
        let user = await User.findOne({
            username: username,
            password: password
        })
        if (user!=null){
            response.send(user);
        }else {
            response.send('sai tk hoac mat khau!')
        }
    }catch (e) {
        response.send(e.message);
    }
});










///////////add bill app
app.post('/addBillApp', async (req, res) => {

    var idUser = req.body.idUser;
    var idProducts = req.body.idProducts;
    var nameProduct = req.body.nameProduct;
    var specieProduct = req.body.specieProduct;
    var imageProduct = req.body.imageProduct;
    var soLuong = req.body.Amount;
    var tong = req.body.Total;
    var priceProduct =  req.body.priceProduct;

    const bill = new Bill({
        idUser: idUser,
        idProducts: idProducts,
        nameProduct:nameProduct,
        imageProduct:imageProduct,
        specieProduct : specieProduct,
        priceProduct:priceProduct,
        Amount: soLuong,
        Total: tong
    });
    await bill.save(function (err, product) {
        if (err) {
            console.log('Them that bai' + bill)
        } else {
            console.log('Them thanh cong' + bill)
        }
    })

});

app.post('/deleteBillApp', async (req, res) => {

    await Bill.findByIdAndDelete(req.body.id + '');
    console.log('id:' + req.body.id);

});

app.post('/editBillApp', async (req, res) => {
    var id1 = req.body.BId;
    var idUser = req.body.idUser;
    var idProducts = req.body.idProducts;
    var nameProduct = req.body.nameProduct;
    var specieProduct = req.body.specieProduct;
    var imageProduct = req.body.imageProduct;
    var priceProduct =  req.body.priceProduct;
    var soLuong = req.body.Amount;
    var tong = req.body.Total;

    try {
        await Bill.findByIdAndUpdate(id1, {
            idUser: idUser,
            idProducts: idProducts,
            nameProduct:nameProduct,
            specieProduct:specieProduct,
            imageProduct:imageProduct,
            priceProduct:priceProduct,
            Amount: soLuong,
            Total: tong
        });
    } catch (e) {
        console.log('id:' + id1);
    }
});






