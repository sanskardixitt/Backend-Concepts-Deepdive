// The JavaScript engine executes code on the main thread (the call stack).

// When it hits an async I/O operation like fs.readFile, it hands that task off to libuv. This is a non-blocking call, so the main thread is free to continue.

// The console.log is a synchronous operation, so it's executed immediately on the call stack.

// When libuv finishes its work (reading the file), it places the corresponding callback function into a queue.

// The event loop, at the appropriate time, sees that the call stack is empty and that there's a callback in the queue. It then pushes that callback onto the call stack to be executed.

// The statement "the callback is placed in a queue" is a simplification. In reality, the Node.js event loop processes several different queues in a set order, called phases. 

// The event loop cycles through these major phases:

// Timers Phase

// This is where callbacks scheduled by setTimeout() and setInterval() are executed. The event loop checks if any timers have expired and runs their callbacks.

// I/O Callbacks Phase

// This phase executes almost all I/O callbacks that were deferred from the last cycle. For example, a networking or file system error callback might run here.

// Poll Phase

// This is the most important phase. The event loop spends most of its time "polling" for new I/O events.

// When an asynchronous I/O operation (like our fs.readFile()) completes, its callback is added to the poll queue.

// When the event loop enters the Poll phase, it will process the callbacks in this queue until the queue is empty or a system-dependent limit is reached.

// So, to answer the question directly: The fs.readFile() callback is executed in the Poll phase.

// Check Phase

// This phase is specifically for callbacks scheduled by setImmediate(). These callbacks run right after the Poll phase has completed.

// Close Callbacks Phase

// This phase is for cleanup activities, executing callbacks for close events like a socket being destroyed (socket.on('close', ...)).





// The Special Case: Microtasks (The "Priority" Queues) 🧐
// This is the most critical detail. There are two "microtask" queues that are not part of the main event loop phases but are processed in between each phase.

// process.nextTick() Queue: Callbacks registered with nextTick() go here. This queue is processed first.

// Promise Jobs Queue: Callbacks from resolved or rejected Promises (i.e., .then(), .catch(), .finally()) go here. This queue is processed second.

// The key rule: After each phase of the event loop finishes, Node will immediately process the entire microtask queue (first nextTick, then Promises) before moving on to the next phase.

// This is why a Promise.resolve().then(...) will always execute before a setTimeout(() => ..., 0) or a setImmediate(...), even though they seem like they should run immediately. The Promise callback is a microtask that gets to "cut in line" before the event loop advances to the Timers or Check phase.

// So, the hierarchy is:

// Synchronous Code on the Call Stack

// Microtasks (process.nextTick, then Promises)

// Macrotasks (the main event loop phases like Timers, I/O, Check)


const fs = require("fs").promises;

console.log('This the start point of the file');

fs.readFile('testFile.txt',(err , data)=>{
    if(err){
        console.log(err);
    }
    console.log(data.toString(),"----this is the data");
});

setTimeout(()=>{
    console.log("This the setTimeout function");
},0);

setImmediate(()=>{
    console.log("This the setImmediate function");
});

Promise.resolve().then(()=>{
    console.log('This the promise function');
});

process.nextTick(()=>{
    console.log('This the process.nextTick function');
});

console.log("end of the synchronous code");

// Some synchronous, CPU-intensive work to demonstrate blocking

console.log("starting of the blocking loop");

for(let i =0 ; i<1000000000;i++){


}

console.log("end of the blocking loop");





// output:
// This the start point of the file
// end of the synchronous code
// starting of the blocking loop
// end of the blocking loop
// This the process.nextTick function
// This the promise function
// This the setTimeout function
// This the setImmediate function
// This is the test file for the general purpose . ----this is the data




// How does this relate to performance?
// Performance in Node.js is almost entirely about not blocking the event loop.


// CPU-Bound Operations are the Enemy: The while loop in the example is a synchronous, CPU-bound task. While it was running, Node.js could do nothing else—it couldn't process I/O, handle network requests, or run timers. A single long-running synchronous function can bring your entire server to a halt because the loop is stuck. This is the #1 performance pitfall in Node.js.

// I/O is Cheap: The loop is designed to handle I/O efficiently. When it sees an I/O request, it hands it off to the system kernel (via libuv) and moves on. The kernel does the work on another thread. The event loop just has to pick up the result later. This is why Node can handle thousands of concurrent network connections with minimal resource usage.

// Microtask Starvation: Be careful with recursive microtasks. If a Promise keeps scheduling another Promise in its .then() block, the event loop will get stuck processing the microtask queue and will be "starved" from ever reaching the next phase (like the Poll phase to handle I/O). This is less common but can be a source of very tricky bugs.

// The Golden Rule for Performance: Keep the main thread free. Any task that takes more than a few milliseconds and is not I/O (e.g., complex calculations, image processing, parsing huge JSON) should be offloaded from the main event loop, typically by using Worker Threads.




// Without async&await and promises


// async function ReadandWrite(){
//     fs.readFile("testFile.txt",(err , data1)=>{

//         if(err){
//             console.log(err);
//         }
    
//         fs.readFile("testFile2.txt",(err , data2)=>{
    
//             if(err){
//                 console.log(err);
//             }
    
//             fs.readFile("testFile3.txt",(err , data3)=>{
                
//                 if(err){
//                     console.log(err);
//                 }
    
//                 fs.writeFile("testFile4.txt",`${data1.toString()} ${data2.toString()} ${data3.toString()}`,(err,data4)=>{
//                     if(err){
//                         console.log(err);}
//                         console.log("created successfully");
//                 })
//             })
//         })
//      })

// }


// "Pyramid of Doom


// async function ReadandWrite() {
//   try {
    
//     const data1 = await fs.readFile("testFile.txt", "utf-8");
//     const data2 = await fs.readFile("testFile2.txt", "utf-8");
//     const data3 = await fs.readFile("testFile3.txt", "utf-8");

    
//     await fs.writeFile("testFile4.txt", `${data1} ${data2} ${data3}`);
//     console.log("File created successfully");

    
//     const data4 = await fs.readFile("testFile4.txt", "utf-8");
//     console.log("text from new file:", data4);

//   } catch (err) {
//     console.error("Error:", err);
//   }
// }




async function ReadandWrite(){

    const promises = [
        fs.readFile("testFile.txt","utf-8"),
        fs.readFile("testFile2.txt","utf-8"),
        fs.readFile("testFile3.txt","utf-8")

    ];

    try {
      const [data1 , data2 ,data3] = await Promise.all(promises);
      console.log("all files read successsfully");

      const combined = `${data1} ${data2} ${data3}`;

      await fs.writeFile("combined.txt",combined);

      const data4 =  await fs.readFile("combined.txt","utf-8");

     console.log(data4.toString())

        
    } catch (err)
       {
        console.log("error", err);
       }
    
}
ReadandWrite();

// This is the most important concept: Promise.all always preserves the order of the original promises.

// It doesn't matter which promise finishes first or last. The array of results will always match the order of the promises you passed in. So even if file3.txt takes 5 seconds and the others take 1, data3 will still be the third item in the result array



// The Promise.all method is designed to fail-fast. This means that as soon as any of the promises in the array rejects, the entire Promise.all immediately rejects with the error from that first failed promise. It does not wait for the other promises to finish.
