import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT;
const MONGO_URL =process.env.MONGO_URL;

async function createConnection() {
  let client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("***connected to mongodb***");
  return client;
}

let client = await createConnection();

app.get("/", async (req, res) => {
  res.send("Student Teacher Dashboard");
});


app.get(`/checkSectionAvailability/:sub`,async(req,res) =>{
    let {sub} = req.params;

    let allSections =[];
  //get all teachers handling the subject
    let getAllTeachers = await client
      .db("Day26")
      .collection("teachers")
      .find({subject:sub})
      .toArray();

      getAllTeachers.map((obj) =>{
        allSections = [...allSections,...obj.classSection];
      })

      res.send(allSections);
})

//store teacher in database Day26 collection teachers
app.post("/createTeacher", async (req, res) => {
  let newTeacher = req.body;

  let checkUser = await client
    .db("Day26")
    .collection("teachers")
    .findOne({ id: newTeacher.id });

  if (checkUser) {
    res.send({
      error: "User with same Id has already been registered. Use different Id",
    });
  } else {
      let result = await client
        .db("Day26")
        .collection("teachers")
        .insertOne(newTeacher);
      if (result) {
        res.send({ msg: true });
      } else {
        res.send({ error: result });
      }
   }
});

//store teacher in database Day26 collection teachers
app.post("/createStudent", async (req, res) => {
    let newStudent = req.body;
  
    let checkUser = await client
      .db("Day26")
      .collection("students")
      .findOne({ id: newStudent.id });
  
    if (checkUser) {
      res.send({
        error: "Student with same Id has already been registered. Use different Id",
      });
    } else {
        let result = await client
          .db("Day26")
          .collection("students")
          .insertOne(newStudent);
        if (result) {
          res.send({ msg: true });
        } else {
          res.send({ error: result });
        }
     }
  });

//api to get all students created
  app.get("/getAllStudents",async(req,res) => {
    let result = await client.db("Day26").collection("students").find().toArray();
    if(result){
        res.send({msg:result});
    }
    else{
        res.send({error:"No student found"});
    }
  })
  

  //get one student details
  app.get("/getStudentDetails/:id",async(req,res) => {
    let {id} = req.params;
    let result = await client.db("Day26").collection("students").findOne({id:id})
    if(result){
        res.send({msg:result});
    }
    else{
        res.send({error:"No student found"});
    }
  })

  //get all teachers created
  app.get("/getAllTeachers",async(req,res) => {
    let result = await client.db("Day26").collection("teachers").find().toArray();
    if(result){
        res.send({msg:result});
    }
    else{
        res.send({error:"No teacher found"});
    }
  })


  //get all sections and classes handled by a teacher

  app.get("/getClasses/:id",async(req,res) => {
    let {id} = req.params;
    
    let getTeacherDetails = await client.db("Day26").collection("teachers").findOne({id:id});
    if(getTeacherDetails){
      res.send({msg:getTeacherDetails});
    }
    else{
      res.send({error:"error"});
    }
  })

//api to store students marks for quarterly halfyearly and annual exams
  app.put("/storeMarks/:id",async(req,res) => {
    let {id} = req.params;
    let storeMarks = req.body;
    if(storeMarks.term === "quarterly"){
         let result = await client.db("Day26").collection("students").updateOne({id:id},{$push:{Quarterly:storeMarks}});
         res.send(result);
    }

    else if(storeMarks.term === "halfyearly"){
         let result = await client.db("Day26").collection("students").updateOne({id:id},{$push:{Halfyearly:storeMarks}});
         res.send(result);
    }
   
    else{
         let result = await client.db("Day26").collection("students").updateOne({id:id},{$push:{Annual:storeMarks}});        
         res.send(result);
    }
    
  })

  //api to store absent dates
  app.put("/markAttendance/:id", async(req,res) => {
    let {id} =req.params;
    let dates = req.body;
    
    let result = await client.db("Day26").collection("students").updateOne({id:id},{$push:{absentDates:dates.absentDates}});
    res.send({msg:result});
  })


  //get all students in a section
  app.get("/getClassStudents/:section",async(req,res) => {
    let {section} = req.params;
    let result = await client.db("Day26").collection("students").find({classSection:section}).toArray();
    if(result) {
      res.send({msg:result});
    }
    else{
      res.send({error:"error"});
    }
  })

app.listen(PORT, () => console.log(`App is listening to port ${PORT}`));
