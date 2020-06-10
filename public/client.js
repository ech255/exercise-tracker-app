// creates event listeners for the insert row submit button (POST), row Edit button (PUT), and row Delete button (DELETE) after the DOM is loaded
document.addEventListener('DOMContentLoaded', insertRow);
document.addEventListener('DOMContentLoaded', deleteRowListener);
document.addEventListener('DOMContentLoaded', editRowPopupListener);

// sends the POST request to insert a row on the server and update the exercise table
function insertRow() {
    // define submit button event listener
    document.getElementById('submitInsert').addEventListener('click', function(event) {
        // get form values
        var name = document.getElementById('name').value;
        var reps = document.getElementById('reps').value;
        var weight = document.getElementById('weight').value;
        var date = document.getElementById('date').value;
        var lbs = document.querySelector('input[name="lbs"]:checked').value;
        // create new request and define payload JSON
        var req = new XMLHttpRequest();
        var payload = {"name": name, "reps": reps, "weight": weight, "date": date, "lbs": lbs};
        // define async POST request and target
        req.open("POST", "http://flip3.engr.oregonstate.edu:24304/", true);
        req.setRequestHeader('Content-Type', 'application/json');
        // create event listener to trigger on request load
        req.addEventListener('load', function() {
            if (req.status >= 200 && req.status < 400) {
                // print success message to console
                console.log("Success: " + req.status + " - " + req.statusText);
                // parse the response JSON
                var response = JSON.parse(req.responseText);
                // regenerate table from response
                var tableBody = document.getElementById('workoutTableBody');
                tableBody.innerHTML = '';
                for (var i=0; i < response.length; i++) {
                    tableBody.insertAdjacentHTML("beforeend", 
                        '<tr>'
                        + '<td>' + response[i].name + '</td>'
                        + '<td>' + response[i].reps + '</td>'
                        + '<td>' + response[i].weight + '</td>'
                        + '<td>' + response[i].date + '</td>'
                        + '<td>' + response[i].lbs + '</td>'
                        + '<td><input type="button" class="edit-button" id="edit-' + response[i].id + '" name="edit-'+ response[i].id + '" value="Edit"></td>'
                        + '<td><input type="button" class="delete-button" id="delete-' + response[i].id + '" name="delete-'+ response[i].id + '" value="Delete"></td>'
                        + '</tr>'
                    );
                }
                // recreate event listeners for delete buttons
                var deleteButtons = document.getElementsByClassName("delete-button");
                for (var i = 0; i < deleteButtons.length; i++) {
                    deleteButtons[i].addEventListener('click', deleteRow, false);
                }
            } else {
                // log error if a network error code is returned
                console.log("Error in network request: " + req.status + " - " + req.statusText);
            }
        });
        // send payload
        req.send(JSON.stringify(payload));
        // prevent page reload that clears data
        event.preventDefault();
    });
};

// creates an event listener on each Delete button located in the exercise table
function deleteRowListener() {
    // define delete button event listeners
    var deleteButtons = document.getElementsByClassName("delete-button");
    for (var i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', deleteRow, false);
    }
}

// sends the DELETE request to delete a row on the server and update the exercise table
function deleteRow() {
    // get id of delete button clicked
    var deleteID = this.id;
    // extract database id using regex
    var databaseID = deleteID.match(/(\d+)/)[0];

    // create new request and define payload JSON
    var req = new XMLHttpRequest();
    var payload = {"id": databaseID};
    console.log(payload);
    // define async DELETE request and target
    req.open("DELETE", "http://flip3.engr.oregonstate.edu:24304/", true);
    req.setRequestHeader('Content-Type', 'application/json');
    // create event listener to trigger on request load
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
            // print success message to console
            console.log("Success: " + req.status + " - " + req.statusText);
            // parse the response JSON
            var response = JSON.parse(req.responseText);
            // regenerate table from response
            var tableBody = document.getElementById('workoutTableBody');
            tableBody.innerHTML = '';
            for (var i=0; i < response.length; i++) {
                tableBody.insertAdjacentHTML("beforeend", 
                    '<tr>'
                    + '<td>' + response[i].name + '</td>'
                    + '<td>' + response[i].reps + '</td>'
                    + '<td>' + response[i].weight + '</td>'
                    + '<td>' + response[i].date + '</td>'
                    + '<td>' + response[i].lbs + '</td>'
                    + '<td><input type="button" class="edit-button" id="edit-' + response[i].id + '" name="edit-'+ response[i].id + '" value="Edit"></td>'
                    + '<td><input type="button" class="delete-button" id="delete-' + response[i].id + '" name="delete-'+ response[i].id + '" value="Delete"></td>'
                    + '</tr>'
                );
            }
            // recreate event listeners for edit and delete buttons
            editRowPopupListener();
            deleteRowListener();
        } else {
            // log error if a network error code is returned
            console.log("Error in network request: " + req.status + " - " + req.statusText);
        }
    });
    // send payload
    req.send(JSON.stringify(payload));
    // prevent page reload that clears data
    event.preventDefault();
}

// creates an event listener on each Edit button located in the exercise table
function editRowPopupListener() {
    // loops through each edit button and adds event listeners
    var editButtons = document.getElementsByClassName("edit-button");
    for (var i = 0; i < editButtons.length; i++) {
        editButtons[i].addEventListener('click', editRowPopUp, false);
    }
}

// generates a popup allowing the user to edit the associated row
function editRowPopUp() {
    // get id of edit button clicked
    var editID = this.id;
    // extract database id using regex
    var databaseID = editID.match(/(\d+)/)[0];
    // get row of data being edited
    var selectedRow = document.getElementById(editID).parentElement.parentElement;
    // generate and insert the editing popup onto the screen
    document.body.insertAdjacentHTML('beforeend', editRowPopUpHTML(selectedRow));
    document.body.insertAdjacentHTML('beforeend', '<div id="edit-id" style="display:none;">'+ databaseID +'</div>');
    // add event listeners for submitting changes to server and for closing the popup with no changes
    editRowSubmitListener();
    editRowCloseListener();
}

// function for generating the HTML string used to create the editing popup
function editRowPopUpHTML(row) {
    // get values from the row that was selected for editing
    var editNameValue = row.children.item(0).innerHTML;
    var editRepsValue = row.children.item(1).innerHTML;
    var editWeightValue = row.children.item(2).innerHTML;
    // need to reformat the date to meet requirements for the input-type:date value attribute
    var editDateValue = new Date(row.children.item(3).innerHTML).toISOString().slice(0,10);
    var editLbsValue = row.children.item(4).innerHTML;
    // change the blank value to apply a checked attribute depending on which measurement is in the row
    var radioLbsChecked = '';
    var radioKgsChecked = '';
    if (editLbsValue == 'lbs') {
        radioLbsChecked = ' checked';
    }
    if (editLbsValue == 'kgs') {
        radioKgsChecked = ' checked';
    }
    // HTML is generated with values inserted
    var generatedEditPopupHTML = '<div id="edit-popup">'
        + '<h3>Edit Selected Exercise</h3>'
        + '<form>'
        + '<div>'
        + '<label for="edit-name">Name: </label>'
        + '<input type="text" id="edit-name" name="edit-name" value= "'+ editNameValue +'" required>'
        + '</div>'
        + '<div>'
        + '<label for="edit-reps">Reps: </label>'
        + '<input type="text" id="edit-reps" name="edit-reps" value= "'+ editRepsValue +'">'
        + '</div>'
        + '<div>'
        + '<label for="edit-weight">Weight: </label>'
        + '<input type="text" id="edit-weight" name="edit-weight" value= "'+ editWeightValue +'">'
        + '</div>'
        + '<div>'
        + '<label for="edit-date">Date: </label>'
        + '<input type="date" id="edit-date" name="edit-date" value= "'+ editDateValue +'">'
        + '</div>'
        + '<div>'
        + '<label for="edit-lbs">Unit: </label>'
        + '<div id="radio-container">'
        + '<div class="radio-div">'
        + '<input type="radio" id="edit-lb" name="edit-lbs" value="1"'+ radioLbsChecked +'>'
        + '<label for="edit-kg">lb</label>'
        + '</div>'
        + '<div class="radio-div">'
        + '<input type="radio" id="edit-kg" name="edit-lbs" value="0"'+ radioKgsChecked +'>'
        + '<label for="edit-kg">kg</label>'
        + '</div>'
        + '</div>'
        + '</div>'
        + '<input id="submit-edit" type="submit" value="Submit">'
        + '</form>'
        + '<input id="close-edit" type="button" value="Close">'
        + '</div>';
    // return the final HTML string
    return generatedEditPopupHTML;
}

// creates an event listener on the close button located on the editing popup
function editRowCloseListener() {
    document.getElementById('close-edit').addEventListener('click', closeEdit, false);
}

// allows the user to close the editing popup with no changes
function closeEdit() {
    // remove editing popup and id div
    document.getElementById('edit-popup').remove();
    document.getElementById('edit-id').remove();
}

// creates an event listener on the submit button located on the editing popup
function editRowSubmitListener() {
    document.getElementById('submit-edit').addEventListener('click', editRow, false);
}

// sends the PUT request to edit a row on the server and update the exercise table
function editRow() {
    // get edited values
    var id = document.getElementById('edit-id').innerHTML;
    var name = document.getElementById('edit-name').value;
    var reps = document.getElementById('edit-reps').value;
    var weight = document.getElementById('edit-weight').value;
    var date = document.getElementById('edit-date').value;
    var lbs = document.querySelector('input[name="edit-lbs"]:checked').value;

    // create new request and define payload JSON
    var req = new XMLHttpRequest();
    var payload = {"id": id, "name": name, "reps": reps, "weight": weight, "date": date, "lbs": lbs};
    // define async PUT request and target
    req.open("PUT", "http://flip3.engr.oregonstate.edu:24304/", true);
    req.setRequestHeader('Content-Type', 'application/json');
    // create event listener to trigger on request load
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
            // remove editing popup and id div
            closeEdit();
            // print success message to console
            console.log("Success: " + req.status + " - " + req.statusText);
            // parse the response JSON
            var response = JSON.parse(req.responseText);
            // regenerate table from response
            var tableBody = document.getElementById('workoutTableBody');
            tableBody.innerHTML = '';
            for (var i=0; i < response.length; i++) {
                tableBody.insertAdjacentHTML("beforeend", 
                    '<tr>'
                    + '<td>' + response[i].name + '</td>'
                    + '<td>' + response[i].reps + '</td>'
                    + '<td>' + response[i].weight + '</td>'
                    + '<td>' + response[i].date + '</td>'
                    + '<td>' + response[i].lbs + '</td>'
                    + '<td><input type="button" class="edit-button" id="edit-' + response[i].id + '" name="edit-'+ response[i].id + '" value="Edit"></td>'
                    + '<td><input type="button" class="delete-button" id="delete-' + response[i].id + '" name="delete-'+ response[i].id + '" value="Delete"></td>'
                    + '</tr>'
                );
            }
            // recreate event listeners for edit and delete buttons
            editRowPopupListener();
            deleteRowListener();
        } else {
            // log error if a network error code is returned
            console.log("Error in network request: " + req.status + " - " + req.statusText);
        }
    });
    // send payload
    req.send(JSON.stringify(payload));
    // prevent page reload that clears data
    event.preventDefault();
}