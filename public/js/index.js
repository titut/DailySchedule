async function ping(){
    const response = await window.versions.ping()
    alert(response);
}

document.querySelector(".get-started-button").addEventListener("click", function(){
    location.href = "create.html"
})