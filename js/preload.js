const { contextBridge, ipcRenderer  } = require('electron')

contextBridge.exposeInMainWorld('db', {
  getNewSchedule: () => ipcRenderer.invoke("getNewSchedule"),
  updateNewSchedule: (schedule) => ipcRenderer.invoke("updateNewSchedule", schedule),
  createSchedule: (schedule) => ipcRenderer.invoke("createSchedule", schedule),
  getSchedule: () => ipcRenderer.invoke("getSchedule"),
  getAllSchedules: ()=>ipcRenderer.invoke("getAllSchedules"),
  getManageDate: ()=> ipcRenderer.invoke("getManageDate"),
  setManageDate: (date)=> ipcRenderer.invoke("setManageDate", date),
  notify: (msg) => ipcRenderer.invoke("showNotification", msg),
  updateSchedule: (schedule)=> ipcRenderer.invoke("updateSchedule", schedule),
  getToDo: ()=> ipcRenderer.invoke("getToDo"),
  addToDo: (name)=> ipcRenderer.invoke("addToDo", name),
  deleteToDo: (id)=> ipcRenderer.invoke("deleteToDo", id),
  editToDo:  (id)=> ipcRenderer.invoke("editToDo", id),
  insertToDo: (data)=> ipcRenderer.invoke("insertToDo", data),
  editSchedule: (date)=> ipcRenderer.invoke("editSchedule", date),
  getEditSchedule: ()=> ipcRenderer.invoke("getEditSchedule"),
  updateEditSchedule: (schedule)=> ipcRenderer.invoke("updateEditSchedule", schedule),
  deleteSchedule: (id)=> ipcRenderer.invoke("deleteSchedule", id)
})