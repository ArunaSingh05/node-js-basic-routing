import * as express from 'express';
import * as morgan from 'morgan';
import * as fsPromises from 'fs';

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

app.use((req, res, next) => {
  console.log("Middleware 1 called.")
  console.log(req.path)
  next() // calling next middleware function or handler
})

// Set multiple middlewares
app.use([ipLogger, reqTime]);

// Error Handling async
app.get('/test1', (req, res, next) => {
  setTimeout(() => {
    try {
      console.log("Async code example.")
      throw new Error("Hello Error!")
    } catch (error) { // manually catching
      next(error) // passing to default middleware error handler
    }
  }, 1000)
})

app.get('/test2', async (req, res, next) => {
  try {
    await fsPromises.readFile("./no-such-file", (err, res) => {
      if (err) throw err;
    })
  } catch (error) {
    next(error);
  }
});

// Custom error handling
app.get('/test3', async (req, res, next) => {
  await fsPromises.readFile("./no-such-file", (err, data) => {
    if (err) {
      res.status(500).send(err)
    }
  })
})

app.get('/', (req: any, res: any) => {
  // Error Handling Sync
  // throw new Error('BROKEN')

  res.send({ message: "Hello,World!", reqTime: req.reqTime });
});

// // Middleware inside route
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

app.use((req, res, next) => {
  console.log("Last middleware called❓") // not called
})

app.use(router);

app.listen(4000);