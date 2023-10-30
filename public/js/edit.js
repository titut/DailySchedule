var schema = {
    date: null,
    activities: []
};

var edit_index = null;

var schema_index = 0;
for(let i of schema.activities){
    addRowToList(i.name, i.start, i.end, schema_index);
    schema_index++;
}

var schedule = new Proxy(schema, {
    set: function(target, key, value){
        if(key == "activities"){
            if(Array.isArray(value)){
                Reflect.set(target, key, value);
            } else {
                var new_val = [...target.activities, value];
                new_val.sort(compareTime);
                Reflect.set(target, key, new_val);
            }
        } else if(key == "date"){
            Reflect.set(target, key, value);
        }
        if(schedule.activities.length > 0){
            document.querySelector(".all-activity").classList.remove("disabled");
            loadList();
        }
        document.querySelector("#all-activity-number").innerHTML = `(${schedule.activities.length})`;
        return true;
    }
});

async function main(){
    let edit_date = await window.db.getEditSchedule();
    let all_schedule = await window.db.getAllSchedules();

    for(let i of all_schedule){
        if(i.date == edit_date){
            schedule.date = i.date;
            schedule.activities = i.activities;
        }
    }

    loadList();
}

main();

document.querySelector(".second-page").style.display = "flex";

document.querySelector(".backtwo").addEventListener("click", function(){
    history.back();
})

document.querySelector(".all-activity").addEventListener("click", function(e){
    if(!e.target.classList.contains("disabled")){
        document.querySelector(".second-page").style.display = "none";
        document.querySelector(".third-page").style.display = "flex";
    }
})

document.querySelector(".backthree").addEventListener("click", function(){
    document.querySelector(".second-page").style.display = "flex";
    document.querySelector(".third-page").style.display = "none";
})

document.querySelector("#activity").addEventListener("change", onSecondPageChange);
document.querySelector("#start").addEventListener("change", onSecondPageChange);
document.querySelector("#end").addEventListener("change", onSecondPageChange);

function onSecondPageChange(e){
    if(e.target.value != "" && document.querySelector("#start").value != "" && document.querySelector("#end").value != ""){
        document.querySelector(".textbar button").classList.add("add-button-active");
    } else {
        document.querySelector(".textbar button").classList.remove("add-button-active");
    }
}

document.querySelector(".textbar button").addEventListener("click", function(e){
    if(e.target.classList.contains("add-button-active")){
        schedule.activities = {
            name: document.querySelector("#activity").value,
            start: document.querySelector("#start").value,
            end: document.querySelector("#end").value
        };
        document.querySelector("#activity").value = "";
        document.querySelector("#start").value = "";
        document.querySelector("#end").value = "";
        e.target.classList.remove("add-button-active");
    }
})

function addRowToList(name, start, end, index){
    document.querySelector(".main-row").innerHTML += `
    <div class="row">
        <div>${name}</div>
        <div>${start}</div>
        <div>${end}</div>
        <div data-id="${index}">
            <button class="edit-icon"><i class="fa-solid fa-pen"></i></button>
            <button class="delete-icon"><i class="fa-sharp fa-solid fa-trash"></i></button>
        </div>
    </div>`

    document.querySelectorAll(".edit-icon").forEach(elem => {
        elem.addEventListener("click", function(e){
            var index = elem.parentNode.dataset.id;
            edit_index = index;
            document.querySelector(".edit-container").style.display = "flex";
            document.querySelector("#edit-activity").value = schedule.activities[index].name;
            document.querySelector("#edit-start").value = schedule.activities[index].start;
            document.querySelector("#edit-end").value = schedule.activities[index].end;
        })
    })

    document.querySelectorAll(".delete-icon").forEach(elem => {
        elem.addEventListener("click", function(e){
            var index = elem.parentNode.dataset.id;
            schedule.activities.splice(index, 1);
            loadList();
        })
    })
}

document.querySelector(".cancel-edit").addEventListener("click", function(){
    document.querySelector(".edit-container").style.display = "none";
})

document.querySelector(".submit-edit").addEventListener("click", function(){
    schedule.activities[edit_index] = {
        name: document.querySelector("#edit-activity").value,
        start: document.querySelector("#edit-start").value,
        end: document.querySelector("#edit-end").value
    }
    loadList();
    document.querySelector(".edit-container").style.display = "none";
})

document.querySelector(".submit-schedule").addEventListener("click", function(){
    window.db.updateEditSchedule({
        date: schedule.date,
        activities: schedule.activities
    });
    location.href = "manage.html";
})

function loadList(){
    document.querySelector(".main-row").innerHTML = "";
    var index = 0;
    for(let i of schedule.activities){
        addRowToList(i.name, i.start, i.end, index);
        index++;
    }
    document.querySelector("#all-activity-number").innerHTML = `(${schedule.activities.length})`;
}

async function getNewSchedule(){
    let data = (await window.db.getNewSchedule());
    schedule.date = data.date;
    schedule.activities = data.activities;
    loadList();
    document.querySelector(".first-page").style.display = "none";
    document.querySelector(".second-page").style.display = "flex";
}

getNewSchedule();

function compareTime(a, b){
    _a = parseInt(a.start.substr(0, 2) * 60) + parseInt(a.start.substr(3, 2));
    _b = parseInt(b.start.substr(0, 2) * 60) + parseInt(b.start.substr(3, 2));

    return _a - _b;
}