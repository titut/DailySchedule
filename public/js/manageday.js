/*
    TO DO LIST:
        COMPLETED CHECKBOX
        TIME REMAINING IN TASK,
        TASK COMPLETED
        TASK REMAINING
*/

/*
    100px = 60 minutes
*/

var monthText = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var time_slot = ["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM","12 PM" ,"1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
var colorPalette = ["#ffed00", "#ff8c00", "#e40303", "#dc3dbc", "#9b30ff"];
var current_activity_temp = {
    text: "",
    activities_completed: 0
};
let start_time_arr = [];
let temp_arr = [];

async function main(){

    var date = await window.db.getManageDate();
    var data = await window.db.getAllSchedules();

    //Get schedule object from database and set the date to the header
    var schedule = null;
    for(let i of data){
        if(i.date == date){
            schedule = i;
        }
    }
    document.querySelector("#header").innerHTML = `${monthText[parseInt(schedule.date.substring(5,7)) - 1]} ${addSubText(schedule.date.substring(8))}, ${schedule.date.substring(0, 4)}`;
    
    var current_activity = new Proxy(current_activity_temp, {
        set(obj, prop, val){
            if(prop == "text"){
                document.querySelector(".current-activity div:nth-child(2)").innerHTML = val;
            }
            if(prop == "activities_completed"){
                document.querySelector(".task-completed div:nth-child(2)").innerHTML = val;
                document.querySelector(".task-remaining div:nth-child(2)").innerHTML = schedule.activities.length - val;
            }
            return Reflect.set(...arguments);
        }
    });

    //re-sort activities in order of when things start
    let index = 0;
    start_time_arr = [];
    temp_arr = [];
    for(let activity of schedule.activities){
        var temp_time = timeToMinutes(activity.start);
        if(index == 0){
            start_time_arr.push(temp_time);
            temp_arr = [activity];
        } else {
            let inserted = false;
            for(let i = 0; i < start_time_arr.length; i++){
                if(temp_time < start_time_arr[i]){
                    start_time_arr.splice(i, 0, temp_time);
                    temp_arr.splice(i, 0, activity);
                    inserted = true;
                    break;
                }
            }
            if(!inserted){
                start_time_arr.push(temp_time);
                temp_arr.push(activity);
            }
        }
        index++;
    }
    schedule.activities = temp_arr;

    //display each slot by length;
    document.querySelector("#body-container").innerHTML = `<div class="current-time-line"></div> <div class="arrow-right"></div>`;
    var today = new Date();
    var today_hours = today.getHours().toString();
    var current_time = today.getHours() + ":" + today.getMinutes();
    if(today_hours.length == 1){
        var current_time = "0" + today.getHours() + ":" + today.getMinutes();
    }
    var current_time_diff = timeToMinutes(current_time) - timeToMinutes("06:00");
    document.querySelector(".current-time-line").style.top = (current_time_diff/60 * 100) + "px";
    document.querySelector(".arrow-right").style.top = (current_time_diff/60 * 100) + "px";

    setInterval(function(){
        today = new Date();
        today_hours = today.getHours().toString();
        current_time = today.getHours() + ":" + today.getMinutes();
        if(today_hours.length == 1){
            current_time = "0" + today.getHours() + ":" + today.getMinutes();
        }
        current_time_diff = timeToMinutes(current_time) - timeToMinutes("06:00");
        document.querySelector(".current-time-line").style.top = (current_time_diff/60 * 100) + "px";
        document.querySelector(".arrow-right").style.top = (current_time_diff/60 * 100) + "px";

        for(let activity of schedule.activities){
            var notif_start_time_diff = timeToMinutes(activity.start) - timeToMinutes("06:00");
            var notif_end_time_diff = timeToMinutes(activity.end) - timeToMinutes("06:00");
            if(notif_end_time_diff == current_time_diff){
                window.db.notify({
                    "title": `Task ended from Daily Schedule!`,
                    "body": `Task "${activity.name}" has ended at ${activity.end} ✅`
                })
            }
            if(notif_start_time_diff == current_time_diff){
                window.db.notify({
                    "title": "Task started from Daily Schedule",
                    "body": `Task "${activity.name}" just started at ${activity.start} 💪`
                })
            }
            if(current_time_diff >= timeToMinutes(activity.start) - timeToMinutes("06:00") && current_time_diff < timeToMinutes(activity.end) - timeToMinutes("06:00")){
                current_activity.text = activity.name;
                document.querySelector(".time-remaining div:nth-child(2)").innerHTML = (timeToMinutes(activity.end) - timeToMinutes("06:00") - current_time_diff) + " minutes";
            }
        }

    }, [1000 * 60]);

    for(let i = 0; i < 19; i++){
        var hour_line = document.createElement("div");
        hour_line.classList.add("hour-line");
        hour_line.style.top = `${i * 100}px`;
        document.querySelector("#body-container").append(hour_line);

        if(i == 18){
            break;
        }

        var hour_text = document.createElement("div");
        hour_text.innerHTML = time_slot[i];
        hour_text.classList.add("hour-text");
        hour_text.style.top = `${i * 100 + 50}px`;
        document.querySelector("#body-container").append(hour_text);
    }
    var color_index = 0;
    var slot_index = 0;

    //draw initial grey box
    var initial_time_diff = timeToMinutes(schedule.activities[0].start) - timeToMinutes("06:00");
    var initial_temp_div = document.createElement("div");
    initial_temp_div.classList.add("slot-space");
    initial_temp_div.style.height = `${initial_time_diff/60 * 100}px`;
    var initial_temp_inner_div = document.createElement("div");
    initial_temp_inner_div.classList.add("slot-grey");
    initial_temp_div.append(initial_temp_inner_div);
    document.querySelector("#body-container").append(initial_temp_div);
    for(let activity of schedule.activities){
        var time_diff = timeToMinutes(activity.end) - timeToMinutes(activity.start);
        if(current_time_diff >= timeToMinutes(activity.start) - timeToMinutes("06:00") && current_time_diff < timeToMinutes(activity.end) - timeToMinutes("06:00")){
            current_activity.text = activity.name;
            document.querySelector(".time-remaining div:nth-child(2)").innerHTML = (timeToMinutes(activity.end) - timeToMinutes("06:00") - current_time_diff) + " minutes";
        }
        var temp_div = document.createElement("div");
        temp_div.classList.add("slot");
        temp_div.style.height = `${time_diff/60 * 100}px`;
        var temp_inner_div = document.createElement("div");
        temp_inner_div.classList.add("slot-box");
        var checked_atr = "";
        if(activity.completed){
            temp_inner_div.classList.add("completed");
            checked_atr = "checked";
            current_activity.activities_completed = current_activity.activities_completed + 1;
        }
        temp_inner_div.innerHTML = `
            <div class="slot-input" data-activity="${activity.name}"><input type="checkbox" ${checked_atr}></div>
            <div class="slot-name">${activity.name}</div>
            <div class="slot-time"><Span><b>Start:</b> ${activity.start}</span> <span><b>End: </b>${activity.end}</span></div>
        `
        temp_div.append(temp_inner_div);
        document.querySelector("#body-container").append(temp_div);
        color_index++;
        if(color_index == 5){
            color_index = 0;
        }

        //draw grey slots between each activities
        if(slot_index == schedule.activities.length - 1){
            break;
        }

        var time_diff = timeToMinutes(schedule.activities[slot_index + 1].start) - timeToMinutes(activity.end);
        var temp_div = document.createElement("div");
        temp_div.classList.add("slot-space");
        temp_div.style.height = `${time_diff/60 * 100}px`;
        var temp_inner_div = document.createElement("div");
        temp_inner_div.classList.add("slot-grey");
        temp_div.append(temp_inner_div);
        document.querySelector("#body-container").append(temp_div);

        slot_index++;
    }

    document.querySelectorAll(".slot-input").forEach((input)=>{
        input.addEventListener("click", function(e){
            let temp_index = 0;
            for(let act_index = 0; act_index < schedule.activities.length; act_index++){
                if(schedule.activities[act_index].name == input.dataset.activity){
                    schedule.activities[act_index].completed = input.firstChild.checked;
                }
            }
            if(input.firstChild.checked){
                input.parentNode.classList.add("completed");
                current_activity.activities_completed = current_activity.activities_completed + 1;
            } else {
                input.parentNode.classList.remove("completed");
                current_activity.activities_completed = current_activity.activities_completed - 1;
            }
            window.db.updateSchedule(schedule);
        })
    })

    
    document.querySelector(".edit-schedule").addEventListener("click", function(){
        window.db.editSchedule(schedule.date);
        location.href="edit.html";
    })
    
    document.querySelector(".reload-schedule").addEventListener("click", function(){
        //delete
        window.db.deleteSchedule(schedule.id);
        location.href="manage.html";
    })
}


function addSubText(day){
    var _day = parseInt(day);
    if(_day == 11 || _day == 12 || _day == 13){
        return day + "th"
    }
    if(_day%10 == 1){
        return day + "st"
    } else if (_day%10 == 2){
        return day + "nd"
    } else if (day%10 == 3){
        return day + "rd"
    } else {
        return day + "th"
    }
}

function timeToMinutes(time){
    return parseInt(time.substring(0, 2)) * 60 + parseInt(time.substring(3));
}

main();