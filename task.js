const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
//import inquirer from 'inquirer'
const inquirer = require('enquirer');

const jsonFilePath = path.join(__dirname, 'tasks.json');
const program = new Command();

program
    .name('my-cli-app')
    .description('A simple CLI app in Node.js')
    .version('1.0.0');

// Function to load tasks from tasks.json
function loadTasks() {
    if (fs.existsSync(jsonFilePath)) {
        const data = fs.readFileSync(jsonFilePath, 'utf-8');
        return JSON.parse(data);
    }
    return [];
}

// Function to save tasks back to tasks.json
function saveTasks(tasks) {
    fs.writeFileSync(jsonFilePath, JSON.stringify(tasks, null, 2), 'utf-8');
}

// Function to prompt user for task input
async function promptUser() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'task',
            message: 'Enter your task: ',
            validate: (input) => input.trim() !== '' || 'Task cannot be empty!',
        },
    ]);
    return answers.task;
}

// Command to add a new task
program
    .command('add')
    .description('Add a new task')
    .action(async () => {
        const taskDescription = await promptUser();
        const tasks = loadTasks(); // Load existing tasks
        const newTask = {
            id: tasks.length + 1,
            task: taskDescription,
            timestamp: new Date().toISOString(),
        };
        tasks.push(newTask);
        saveTasks(tasks); // Save updated tasks array
        console.log(' Task added successfully!');
    });

// Command to list all tasks
program
    .command('list')
    .description('List all tasks')
    .action(() => {
        const tasks = loadTasks();
        if (tasks.length === 0) {
            console.log(' No tasks found.');
        } else {
            console.log(' Tasks:');
            tasks.forEach((task) => {
                console.log(`${task.id}. ${task.task} (⏳ ${task.timestamp})`);
            });
        }
    });
    program
    .command('delete <id>')
    .description('delete tasks by id')
    .action((id) => {
        const tasks = loadTasks();
        const taskIndex = tasks.findIndex((task) => task.id === parseInt(id))
        if(taskIndex !== -1){
            const deletedTask = tasks.splice(taskIndex,1);
            tasks.forEach((task) => {
                if(task.id >= 1 ){
                    task.id--;
                }else{
                    task.id;
                }
            })
        saveTasks(tasks);
        console.log("the task in now deleted");
        }else{
       console.log("The task is not found");
            return;
        }
    })
    program
    .command('done <id>')
    .description('marking done tasks')
    .action((id) => {
        const tasks = loadTasks();
        const taskIndex = tasks.findIndex((task)=> task.id === parseInt(id));
        if(taskIndex === -1){
            console.log("The task is not found");
            return;
        }
        tasks[taskIndex].done = true;
        saveTasks(tasks);
        console.log(`${tasks[taskIndex].task} is marked done`)
    })
    program
    .command('list-done')
    .description('listing the done tasks')
    .action(() => {
        const tasks = loadTasks().filter(task => task.done)
        if(tasks.length === 0){
            console.log('no completed tasks')
        }else{
            console.log("completed tasks")
            tasks.forEach(task => console.log(`${task.id}.${task.task} is completed \n`));
        }
    })
    program
    .command('list-undone')
    .description('For listing the undone tasks')
    .action(()=>{
        const tasks = loadTasks().filter(task => !task.done)
        if(tasks.length === 0){
            console.log("no pending tasks")
        }else{
            console.log("Pending tasks")
            tasks.forEach(task => console.log(`${task.id}.${task.task} is not yet done \n`))
        }
    })
//starting the CLI app
program.parse(process.argv);
