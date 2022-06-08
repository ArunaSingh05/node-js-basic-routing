import express from 'express';
import morgan from 'morgan';
const app = express();


// Fetch data from request object
const ipLogger = (req: any, res: any, next: any) => {
  console.log(req.ip);
  next();
};

// Alter request object
const reqTime = (req: any, res: any, next: any) => {
  req.reqTime = new Date();
  next();
};

app.use(morgan('dev'))

app.use(express.json());

// Set multiple middlewares
// app.use([ipLogger, reqTime]);

app.get('/', (req: any, res: any) => {
  res.send({ message: "Hello,World!", reqTime: req.reqTime });
});

// Middleware inside route
app.get('/data', [ipLogger, reqTime], (req: any, res: any) => {
  res.send({ message: "Hello", reqTime: req.reqTime });
});

app.post("/data", (req: any, res: any) => {
  res.send(req.body);
})

const router = express.Router();

// Chain middlewares together
router.get("/user/:id",
  (req: any, res: any, next: any) => {
    console.log('Request URL:', req.originalUrl)
    next();
  },
  (req: any, res: any, next: any) => {
    console.log('Request URL:', req.method)
    next();
  },
  (req: any, res: any, next: any) => {
    res.json({
      status: true,
      id: req.params.id
    })
  });

app.use(router);

app.listen(4000);