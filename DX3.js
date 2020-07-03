on("chat:message", function(msg) {
    if (msg.type == "api" && msg.content.indexOf("!sr ") !== -1) {
        var numdice = msg.content.replace("!sr ", "");
        sendChat(msg.who, dx(numdice, msg.who));
    }
});

// initialize array for table formatting
var signArray = [" "];
var rollNumArray = new Array(0);
var rollStrArray = new Array(0);


function dx(triggermsg, name) {
    //var varcou = 0;
    var finallynum = 0;
    var returnStr = triggermsg + ' → \n';
    var match = /^(\d+)(dx)(\d|)(((\+|-)(\d+)|)((\+|-)(\d+)|))$/i.exec(triggermsg); //Algorithm [0]2dx8-2+10,[1]2,[2]dx,[3]8,[4]-2+10,[5]-2,[6]-,[7]2,[8]+10,[9]+,[10]10 
    if (match === undefined || match === null || match.length < 11) {
        return "input error, try again!";
    }
    // console.log(match);
    if (match[3] == "") {
        match[3] = 10
    }
    if (match[3] < 2) {
        var rply = 'Critical Value must be greater than 2';
        return rply;
    }

    for (var round = 1; round > 0; round--) {
        [match, round, rollStr, finallynum] = dxroll(match, round, returnStr, finallynum);
        // push to arrays
        rollNumArray.push(finallynum.toString());
        rollStrArray.push(rollStr);
        signArray.push("+");
    }

    returnStr = returnStr.replace(/[,][ ]+]/ig, ']');

    log(returnStr)

    // add final modifier to get final value
    var modifierSum = undefined;
    // if modifier exists, initialize it
    if (match[4] !== "") {
        modifierSum = 0;
        // 1st modifier
        if (match[6] == '+') {
            modifierSum += parseInt(match[7]);
        } else if (match[6] == '-') {
            modifierSum -= parseInt(match[7]);
        }
        // 2nd modifier
        if (match[9] == '+') {
            modifierSum += parseInt(match[10]);
        } else if (match[9] == '-') {
            modifierSum -= parseInt(match[10]);
        }
        finallynum += modifierSum;
    }


    // generate table-formatted string
    // style tags
    var tdStyle1 = " style='text-align:center; padding: 5px; line-height: 1.4em; border-bottom: 1px solid #ddd; background-color: #ffffff; border-collapse:collapse; width:10px;' "
    var tdStyle2 = " style='text-align:center; padding: 5px; line-height: 1.4em; border-bottom: 1px solid #ddd; background-color: #ffffff; border-collapse:collapse; width:20px;' "
    var tdStyle3 = " style='text-align:left; padding: 5px; line-height: 1.4em; border-bottom: 1px solid #ddd; background-color: #ffffff; border-collapse:collapse;' "
    var tableStr = "<div style='overflow-x:auto;'><table style='border:1px solid #ddd; border-collapse:collapse; table-layout:auto;'><tbody>"
    // table title; as caption tag is not supportd, use colspan
    tableStr += "<tr><th style='padding: 5px; line-height: 1.4em; border:1px solid #aaa; text-align:center; background-color: #292929; color: #f2f2f2' colspan=3>" + name + '|' + triggermsg + "</th></tr>"
    // add row for each roll result
    var rowNum = rollStrArray.length;
    for (var i = 0; i < rowNum; i++) {
        tableStr += "<tr>";
        tableStr += "<td" + tdStyle1 + ">" + signArray[i] + "</td>";
        tableStr += "<td" + tdStyle2 + "><b>" + rollNumArray[i] + "</b></td>";
        tableStr += "<td" + tdStyle3 + ">" + rollStrArray[i] + "</td>";
        tableStr += "</tr>";
    }

    // add row for modifier
    if (modifierSum !== undefined) {
        tableStr += "<tr>";
        tableStr += "<td" + tdStyle1 + ">" + (modifierSum >= 0 ? "+" : "-") + "</td>";
        tableStr += "<td" + tdStyle2 + "><b>" + (modifierSum >= 0 ? modifierSum : -modifierSum) + "</b></td>";
        tableStr += "<td" + tdStyle3 + ">(" + match[4] + ")</td>";
        tableStr += "</tr>";
    }

    // add row for final result
    tableStr += "<tr>";
    tableStr += "<td" + tdStyle1 + ">=</td>";
    tableStr += "<td" + tdStyle2 + "><mark><b>" + finallynum + "</b></mark></td>";
    tableStr += "<td" + tdStyle3 + "></td>";
    tableStr += "</tr>";
    tableStr += "</tbody></table></div>"

    // you can select either tableStr or fullStr here
    var reply = tableStr;
    rollNumArray = [];
    rollStrArray = [];
    signArray = [];

    returnStr += match[4] + '\n' + ' → ' + finallynum;
    var rply = returnStr;

    return reply;

}

function dxroll(match, round, returnStr, finallynum) {
    var result = 0;
    var rollnum = match[1];
    match[1] = 0;
    var varcou = "";
    var varsu = "";
    for (var i = 0; i < rollnum; i++) {
        varcou = Math.floor(Math.random() * 10) + 1;
        if (varcou > result) {
            result = varcou
        }
        if (varcou >= Number(match[3])) {
            result = 10;
            match[1]++;
        }
        varsu += varcou + ', ';
    }
    returnStr += result + '[' + varsu + ']';

    var rollStr = '[' + varsu + ']';
    // remove any dangling commas
    rollStr = rollStr.replace(/[,][ ]+\]/ig, ']');

    finallynum += Number(result);
    if (match[1] >= 1) {
        round++;
        returnStr += '+ ';
    }
    return [match, round, rollStr, finallynum];
}
