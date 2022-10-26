let entryTemplate =  document.getElementById("entry-template");
let entriesDiv = document.getElementById("list-entries");
let flash = document.getElementById("flash");
let contentField = document.getElementById("add-entry-content");
let dateField = document.getElementById("add-entry-date");
let flashDiv = document.getElementById("flash");

//boring format date stuff
let dateToday = new Date();
let month = dateToday.getMonth() + 1;
let day = dateToday.getDate();
let year = dateToday.getFullYear();

if (month < 10)
    month = '0' + month.toString();
if (day < 10)
    day = '0' + day.toString();

// set min date to today
let minDate = year + '-' + month + '-' + day;
dateField.setAttribute("min",minDate);

//load entries from local storage
for (let i = 0; i < localStorage.length; i++){
    let uuid = localStorage.key(i);
    let data = JSON.parse(localStorage.getItem(uuid));
    addEntry(data.content,data.date,uuid);
}

document.getElementById("add-button").addEventListener("click",()=>{
    addEntry();
});


function addFlash(message)
{
    flashDiv.classList.remove("is-excluded");
    flashDiv.innerText = message;
}

function addEntry(newContent,newDate,uuid)
{
    //prepare template
    flashDiv.classList.add("is-excluded");
    let entryTemplateClone = entryTemplate.content.cloneNode(true);
    let entry = entryTemplateClone.children[0];
    entry.setAttribute("data-uuid",uuid ?? crypto.randomUUID())

    //read values from inputs
    let entryContent = entry.getElementsByClassName("entry-content")[0];
    entryContent.innerText = newContent ?? contentField.value;

    let entryDate = entry.getElementsByClassName("entry-date")[0];
    entryDate.innerText = newDate ?? dateField.value;

    //check if values are valid
    if(entryContent.innerText.length < 3 || entryContent.innerText.length > 255 || entryDate.innerText=="")
    {
        addFlash("invalid data");
        return;
    }

    //create and handle events
    let actions = entry.getElementsByClassName("entry-actions")[0];
    let deleteButton=actions.getElementsByClassName("fa-xmark")[0];

    //remove item
    deleteButton.addEventListener("click",()=>{
        entriesDiv.removeChild(deleteButton.parentNode.parentNode);
        localStorage.removeItem(entry.getAttribute("data-uuid"));
    });

    //enable item editing
    let modifyButton=actions.getElementsByClassName("fa-pen-to-square")[0];
    modifyButton.addEventListener("click",()=>{
        entryContent.setAttribute("contenteditable","true");
        entryContent.classList.add("is-active");
    });

    //disable item editing
    let disableEditing = () => {
        entryContent.removeAttribute("contenteditable");
        entryContent.classList.remove("is-active");

        //update storage
        localStorage.setItem(entry.getAttribute("data-uuid"),JSON.stringify({
            content: entryContent.innerText,
            date: entryDate.innerText
        }))
    }

    //disable on click outside
    entryContent.addEventListener("mouseout",(event)=>{
        event.preventDefault();
        if(event.target === document.activeElement)
        {
            disableEditing();
        }
    });

    //disable after enter press
    entryContent.addEventListener("keyup",(event)=>{
        event.preventDefault();
        //check for enter
        if(event.keyCode === 13) 
        {
            entryContent.innerText = entryContent.innerText.replace(/\n/g, "")
            disableEditing();
        }
    });
    
    //save item to local storage
    localStorage.setItem(entry.getAttribute("data-uuid"),JSON.stringify({
        content: entryContent.innerText,
        date: entryDate.innerText
    }))

    //add to html
    entriesDiv.appendChild(entryTemplateClone);
}

//search items
let searchInput = document.getElementById("search-input");
document.getElementById("search-button").addEventListener("click",()=>{
    for(let entry of entriesDiv.children)
    {
        let parent = entry.getElementsByClassName("entry-content")[0];
        let content = parent.innerText;
        console.log(content)
        let index = content.indexOf(searchInput.value);
        if(index !== -1)
        {
            entry.classList.remove("is-excluded");
            
            //either match or empty search
            if(searchInput.value != "")
            {
                 //mark
                let span = "<span class='highlight'>" + searchInput.value + "</span>"
                content = content.replace(searchInput.value,"");
                let newContent = content.substring(0, index) + span + content.substring(index);
                parent.innerHTML = newContent;
            }
            else
            {
                //unmark
                let span = entry.getElementsByClassName("highlight")[0];
                if(!span)
                    continue;

                indexBegin = parent.innerHTML.indexOf("<span");
                indexEnd = parent.innerHTML.indexOf("</span>");
                
                parent.innerHTML = parent.innerHTML.substring(0, indexBegin) + span.innerText + parent.innerHTML.substring(indexEnd);
                console.log(parent.innerHTML);
            }
        }  
        else
        {
            entry.classList.add("is-excluded");
        }
            
    }
});

