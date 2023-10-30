/*
    <div class="manage-body-row">
        <div class="schedule">7/19/2023</div>
        <div class="schedule">7/19/2023</div>
        <div class="schedule">7/19/2023</div>
      </div>
*/

async function main(){
    let data = await window.db.getAllSchedules();
    let index = 0;
    for(let i of data){
        if(index%3 == 0){
            document.querySelector(".manage-body").innerHTML += `
                <div class="manage-body-row">

                </div>
            `
        }
        document.querySelector(".manage-body").lastElementChild.innerHTML += `
            <div class="schedule">${i.date}</div>
        `
        index++;
    }
    document.querySelectorAll(".schedule").forEach((schedule)=>{
        schedule.addEventListener("click", function(e){
            window.db.setManageDate(e.target.innerHTML);
            location.href = "managedate.html"
        })
    })
}

main();