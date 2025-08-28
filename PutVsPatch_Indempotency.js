 // PUT replaces the entire resource, while PATCH applies a partial modification.

// What is Idempotency?
// An operation is idempotent if making the same request multiple times produces the same result and has the same effect on the server as making it just once. The first request might change the state, but every subsequent identical request will not change the state further.


// Why PUT is Idempotent 👍
// With PUT, you send the entire resource as you want it to be.

// Example: You want to update a user's profile.

// Request: PUT /users/123 with the body { "name": "Alice", "email": "alice@new.com" }.

// First time: The user's profile is updated to exactly this state.

// Second time (due to a retry): You send the exact same request again. The server takes the body and sets the user's profile to that state again. The final result is identical. The user's name is still "Alice" and their email is still "alice@new.com". Nothing has changed since the first request completed.


// Why PATCH is Not Idempotent 👎
// With PATCH, you send instructions on how to change the resource, not the final state of the resource itself.

// Example: You want to increment the like_count on a post.

// Request: PATCH /posts/456 with a body like { "operation": "increment", "field": "like_count" }.

// First time: The like_count goes from, say, 10 to 11.

// Second time (due to a retry): You send the exact same request again. The server receives the same "increment" instruction and applies it again. The like_count goes from 11 to 12.

// Because the second request changed the state of the server further, the operation is not idempotent. This is why PATCH is useful for actions like incrementing or appending, while PUT is best for a complete replacement.


const express = require('express');
const app = express();


app.use(express.json());

let Users = [
    { "name": "sanskar", "id": 1 },
    { "name": "aman", "id": 2 }
];



//api endpoints

app.put("/userEdit/:id", (req, res) => {
    const userId = parseInt(req.params.id); 
  
    const userIndex = Users.findIndex(u => u.id === userId); 
  
    if (userIndex === -1) {
      return res.status(404).json({ error: "NOT FOUND" });
    }
  
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "BAD REQUEST" });
    }
  
    const updatedUser = {
      id: userId,
      name: name,
    };
  
    Users[userIndex] = updatedUser;
  
    console.log(`PUT user updated:`, updatedUser);
    return res.json({ message: "User updated successfully", user: updatedUser });
  });
  



app.patch("/users/:id",(req,res)=>{

    const userId = parseInt(req.params.id);
    const userIndex = Users.findIndex(u => u.id === userId);

    const updates = req.body;

    if(userIndex == -1)
    {
        return res.status(404).json({"error" : "NOT FOUND"});
    }

    const originalUser = Users[userIndex];

    if(Object.keys(updates).length == 0)
    {
        return res.status(400).json({"error" : "BAD REQUEST"});
    }

    const updatedUser = {...originalUser , ...updates};

    Users[userId]=updatedUser;

    return res.status(200).json({"message" : "user updated "});
})

app.listen("5000",()=>{

    console.log("server is listening on the port 5000");

})