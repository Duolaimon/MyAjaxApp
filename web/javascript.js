var req;
var isIE;
var completeField;
var completeTable;
var autoRow;


function doCompletion() {
    var url = "autocomplete?action=complete&id=" + encodeURI(completeField.value);
    req = initRequest();
    req.open("GET", url, true);
    req.onreadystatechange = callback;
    req.send(null);
}

function initRequest() {
    if (window.XMLHttpRequest) {
        if (navigator.userAgent.indexOf('MSIE') != -1) {
            isIE = true;
        }
        return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        isIE = true;
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}

/**
 * One purpose of init() is to make elements inside the index
 * page accessible to other functions that will modify the index page's DOM.
 */
function init() {
    completeField = document.getElementById("complete-field");
    completeTable = document.getElementById("complete-table");
    autoRow = document.getElementById("auto-row");
    completeTable.style.top = getElementY(autoRow) + "px";
}
/**
 *
 * @param firstName
 * @param lastName
 * @param composerId
 * This function creates a new table row, inserts a link to a composer into it using the
 * data passed to the function via its three parameters,
 * and inserts the row into the index page's complete-table element.
 */
function appendComposer(firstName,lastName,composerId) {

    var row;
    var cell;
    var linkElement;

    if (isIE) {
        completeTable.style.display = 'block';
        row = completeTable.insertRow(completeTable.rows.length);
        cell = row.insertCell(0);
    } else {
        completeTable.style.display = 'table';
        row = document.createElement("tr");
        cell = document.createElement("td");
        row.appendChild(cell);
        completeTable.appendChild(row);
    }

    cell.className = "popupCell";

    linkElement = document.createElement("a");
    linkElement.className = "popupItem";
    linkElement.setAttribute("href", "autocomplete?action=lookup&id=" + composerId);
    linkElement.appendChild(document.createTextNode(firstName + " " + lastName));
    cell.appendChild(linkElement);
}
/**
 *
 * @param element
 * @returns {number}
 * This function is applied to find the vertical position of the parent element.
 * This is necessary because the actual position of the element,
 * when it is displayed, is often dependent on browser type and version.
 * Note that the complete-table element, when displayed containing composer names,
 * is shifted to the lower right of the table in which it exists.
 * The correct height positioning is determined by getElementY().
 */
function getElementY(element){

    var targetTop = 0;

    if (element.offsetParent) {
        while (element.offsetParent) {
            targetTop += element.offsetTop;
            element = element.offsetParent;
        }
    } else if (element.y) {
        targetTop += element.y;
    }
    return targetTop;
}
/**
 * This function sets the display of the complete-table element to 'none', (i.e., makes it invisible),
 * and it removes any existing composer name entries that were created.
 */
function clearTable() {
    if (completeTable.getElementsByTagName("tr").length > 0) {
        completeTable.style.display = 'none';
        for (var loop = completeTable.childNodes.length -1; loop >= 0 ; loop--) {
            completeTable.removeChild(completeTable.childNodes[loop]);
        }
    }
}
function callback() {

    clearTable();

    if (req.readyState == 4) {
        if (req.status == 200) {
            parseMessages(req.responseXML);
        }
    }
}
/**
 *
 * @param responseXML
 * @returns {boolean}
 * The parseMessages() function receives as a parameter an object representation of the
 * XML document returned by the AutoComplete servlet. The function programmatically traverses the XML document,
 * extracting the firstName, lastName, and id of each entry, then passes this data to appendComposer().
 * This results in a dynamic update to the contents of the complete-table element.
 */
function parseMessages(responseXML) {

    // no matches returned
    if (responseXML == null) {
        return false;
    } else {

        var composers = responseXML.getElementsByTagName("composers")[0];

        if (composers.childNodes.length > 0) {
            completeTable.setAttribute("bordercolor", "black");
            completeTable.setAttribute("border", "1");

            for (var loop = 0; loop < composers.childNodes.length; loop++) {
                var composer = composers.childNodes[loop];
                var firstName = composer.getElementsByTagName("firstName")[0];
                var lastName = composer.getElementsByTagName("lastName")[0];
                var composerId = composer.getElementsByTagName("id")[0];
                appendComposer(firstName.childNodes[0].nodeValue,
                    lastName.childNodes[0].nodeValue,
                    composerId.childNodes[0].nodeValue);
            }
        }
    }
}