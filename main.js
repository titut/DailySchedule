const { app, BrowserWindow, ipcMain, Menu, Notification } = require('electron');
const { exec } = require("child_process");
const electronReload = require('electron-reload')
const path = require('path');
const db = require('minim-json-db');
const uuid = require("uuid");
const collection = db.collection("schedules");
const todo_collection = db.collection("todo");
var new_schedule = null;
var manage_date = null;

var month = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
var edit_date = null;

function showNotification(title, body){
    new Notification({ title: title, body: body, icon: "./public/img/logo.png" }).show();
}

electronReload(__dirname);

const createWindow = () => {

    const win = new BrowserWindow({
        title:"Daily Schedule",
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'js/preload.js')
        },
        resizable: false,
        icon: path.join(__dirname, 'public/img/logo.png')
    })
    var today = new Date();
    ipcMain.handle("getNewSchedule", ()=>{
        return new_schedule;
    })
    ipcMain.handle("updateNewSchedule", (event, schedule)=>{
        new_schedule = schedule;
    })
    ipcMain.handle("createSchedule", (event, schedule) => collection.insert(schedule));
    ipcMain.handle("getSchedule", async ()=>{
        collection.sync();
        console.log({ "date": today.getFullYear() + "-" + month[today.getMonth()] + "-" + today.getDate()});
        return await collection.findOne({ "date": today.getFullYear() + "-" + month[today.getMonth()] + "-" + today.getDate()});
    })
    ipcMain.handle("getAllSchedules", ()=>{
        collection.sync();
        return collection.find();
    });
    ipcMain.handle("getManageDate", ()=>{
        return manage_date;
    })
    ipcMain.handle("setManageDate", (event, date)=>{
        manage_date = date;
    })
    ipcMain.handle("showNotification", (event, msg) => showNotification(msg.title, msg.body));
    ipcMain.handle("updateSchedule", (event, schedule)=>{
        collection.update({"date": schedule.date}, schedule)
    });
    ipcMain.handle("getToDo", ()=>{
        return todo_collection.find();
    })
    ipcMain.handle("addToDo", async (event, name)=>{
        await todo_collection.insert({
            "name": name,
            "todo_id": uuid.v4(),
            "sub": []
        })
        return todo_collection.find();
    })
    ipcMain.handle("deleteToDo", async(event, id)=>{
        let todos = await todo_collection.find({});
        console.log(todos);
        for(let i of todos){
            if(i.sub.length != 0){
                let index = 0;
                for(let j of i.sub){
                    if(j.todo_id == id){
                        i.sub.splice(index, 1);
                        todo_collection.update({"todo_id": i.todo_id}, i);
                        return todo_collection.find();
                    }
                    index++;
                }
            }
        }
        await todo_collection.delete({todo_id: id});
        return todo_collection.find();
    })
    ipcMain.handle("insertToDo", async(event, data)=>{
        let todos = await todo_collection.find();
        let to_insert = null;
        let insert_loc = null;
        for(let i of todos){
            if(i.todo_id == data.insert_location){
                insert_loc = i;
            }
        }
        for(let i of todos){
            if(i.todo_id == data.insert_id){
                to_insert = i;
            }
        }
        insert_loc.sub.push(to_insert)
        await todo_collection.update({"todo_id":insert_loc.todo_id}, insert_loc);
        await todo_collection.delete({"todo_id":to_insert.todo_id});
        return todo_collection.find();
    });
    ipcMain.handle("editSchedule", function(event, date){
        //("code C:/Users/trove/AppData/Roaming/dailyschedule/schedules.json");
        edit_date = date;
    });
    ipcMain.handle("getEditSchedule", function(){
        return edit_date;
    })
    ipcMain.handle("updateEditSchedule", function(event, schedule){
        collection.update({"date": schedule.date}, schedule);
    })
    ipcMain.handle("deleteSchedule", function(event, id){
        collection.delete({"id": id})
    })

    win.loadFile('public/html/index.html');

    return win;
}

app.whenReady().then(() => {
    var cur_win = createWindow();

    const menu = [
        {
            label: "File",
            submenu: [
                {
                    label: "Quit",
                    click: () => app.quit(),
                    accelerator: "Ctrl+W"
                },
                {
                    label: "Edit",
                    click: () => {cur_win.webContents.openDevTools()},
                    accelerator: "Ctrl+Shift+I"
                }
            ]
        }
    ]

    //implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

