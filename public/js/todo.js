let opened = [];
let list = [];
let todos = new Proxy(list, {
    set(obj, prop, val){
        document.querySelector(".todolist").innerHTML = "";
        for(let i of val){
            var icon = `<div class="caret"><i class="fa-sharp fa-solid fa-caret-up"></i></div>`;
            var extendable = "extendable";
            if(i.sub.length == 0){
                icon = `<div class="square"><i class="fa-sharp fa-solid fa-square"></i></div>`;
                extendable = "";
            }
            document.querySelector(".todolist").innerHTML += `
            <div class="todo ${extendable}" data-id="${i.todo_id}" draggable="true">
                ${icon}
                <div class="text">${i.name}</div>
                <div class="action">
                    <button class="icon edit-icon"><i class="fa-solid fa-pen"></i></button>
                    <button class="icon delete-icon"><i class="fa-sharp fa-solid fa-trash"></i></button>
                </div>
            </div>
            `
            /*if(i.sub.length != 0){
                for(let j of i.sub){
                    document.querySelector(".todolist").innerHTML += `
                    <div class="todo2" data-id="${j.todo_id} data-parent="${i.todo_id}">
                        <div class="square"><i class="fa-sharp fa-solid fa-square"></i></div>
                        <div class="text">${j.name}</div>
                        <div class="action">
                            <button class="icon edit-icon"><i class="fa-solid fa-pen"></i></button>
                            <button class="icon delete-icon"><i class="fa-sharp fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    `
                }
            }*/
        }
        document.querySelectorAll(".todo").forEach((div)=>{
            div.addEventListener("dragstart", function(e){
                e.dataTransfer.setData("text/plain", div.dataset.id);
            })
            div.addEventListener("dragover", function(e){
                e.preventDefault();
            })
            div.addEventListener("drop", async function(e){
                let data = e.dataTransfer.getData("text/plain");
                if(data == div.dataset.id){
                    return
                }
                todos.list = await window.db.insertToDo({
                    insert_id: data,
                    insert_location: div.dataset.id
                });
            })
            div.addEventListener("click", function(){
                if(div.classList.contains("extendable")){
                    if(opened.includes(div.dataset.id)){
                        opened.splice(opened.indexOf(div.dataset.id), 1);
                        div.querySelector(".caret").classList.remove("rotate");
                        document.querySelectorAll(".todo2").forEach(todo2=>{
                            if(todo2.dataset.parent == div.dataset.id){
                                todo2.parentNode.removeChild(todo2);
                            }
                        })
                    } else {
                        opened.push(div.dataset.id);
                        div.querySelector(".caret").classList.add("rotate");
                        for(let i of todos.list){
                            if(i.todo_id == div.dataset.id){
                                for(let j of i.sub){
                                    var new_node = document.createElement("div");
                                    new_node.dataset.id = j.todo_id;
                                    new_node.dataset.parent = i.todo_id;
                                    new_node.classList.add("todo2");
                                    new_node.innerHTML = `
                                        <div class="square"><i class="fa-sharp fa-solid fa-square"></i></div>
                                        <div class="text">${j.name}</div>
                                        <div class="action">
                                            <button class="icon edit-icon"><i class="fa-solid fa-pen"></i></button>
                                            <button class="icon delete-icon"><i class="fa-sharp fa-solid fa-trash"></i></button>
                                        </div>
                                    `
                                    div.parentNode.insertBefore(new_node, div.nextSibling);
                                }
                            }
                        }
                        document.querySelectorAll(".delete-icon").forEach((del)=>{
                            del.addEventListener("click", async function(){
                                todos.list = await window.db.deleteToDo(del.parentNode.parentNode.dataset.id);
                            })
                        });
                    }
                }
            });
        });
        document.querySelectorAll(".delete-icon").forEach((del)=>{
            del.addEventListener("click", async function(){
                todos.list = await window.db.deleteToDo(del.parentNode.parentNode.dataset.id);
            })
        });
        Reflect.set(...arguments);
    }
});

function sing(){
    alert("SING");
}

async function main(){

    todos.list = await window.db.getToDo();

    document.querySelector(".add").addEventListener("click", async function(){
        var temp_todo_name = document.querySelector("#activity").value;
        if(temp_todo_name == ""){
            alert("Please fill out the textarea before adding activity.");
        } else {
            document.querySelector("#activity").value = "";
            todos.list = await window.db.addToDo(temp_todo_name);
        }
    })

}

main();