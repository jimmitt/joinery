var initialized = false;
var shape = [];
var cursorIcon;
var jointLines;
var tempLines;
var highlight;
var shapeColor = [];
var ctx;

function init() {
	if (!initialized) {
		initForms();
	}
	paper.install(window);
	var canvas = document.getElementById('paperCanvas');
	$('#paperCanvas').css({'width':window.innerWidth, 'height':window.innerHeight});
	$('#bgCanvas').attr({'width':window.innerWidth, 'height':window.innerHeight});
	cursorPt = new Point(-1, -1);
	pcursorPt = new Point(-1, -1);
	mousePosition = new Point(-1, -1);
	paper.setup(canvas);
	cursorIcon = new Group();
	jointLines = new Group();
	tempLines = new Group();
	highlight = new Group();
	var bgCanvas = document.getElementById('bgCanvas');
	ctx = bgCanvas.getContext('2d');
	paperScale = 1.0;
	drawGrid();
	initialized = true;
}

function drawGrid() {
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	if (shape.length>0) {
		var gridSize;
		if (docUnits=='mm') {
			gridSize = Math.round(paperScale * 20);
		} else {
			gridSize = Math.round(paperScale * 25.4);
		}
		var count = 0;
		for (var i=0; i<window.innerWidth; i=i+gridSize) {
			ctx.beginPath();
			ctx.strokeStyle = "#F0F0F0"
			if (count%5==0 && docUnits=='mm') {
				ctx.strokeStyle = "#FFFFFF"
			} else if (count%6==0 && docUnits=='in') {
				ctx.strokeStyle = "#FFFFFF"
			}
			ctx.moveTo(i-0.5, -0.5);
			ctx.lineTo(i-0.5, window.innerHeight+0.5);
			ctx.stroke();
			count++;
		}
		count = 0;
		for (var i=0; i<window.innerHeight; i=i+gridSize) {
			ctx.beginPath();
			ctx.strokeStyle = "#F0F0F0"
			if (count%5==0 && docUnits=='mm') {
				ctx.strokeStyle = "#FFFFFF"
			} else if (count%6==0 && docUnits=='in') {
				ctx.strokeStyle = "#FFFFFF"
			}
			ctx.moveTo(-0.5, i-0.5);
			ctx.lineTo(window.innerWidth+0.5, i-0.5);
			ctx.stroke();
			count++;
		}
	}	
}

var inchToMM = 25.4;
var paperScale = 1.0;
var docUnits = 'mm';
var SVGString = [];
var SVGprocessed = false;

function processSVG(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
		var units = '';
		var w, h;
		var splitString = file.split(' ');
		for (i in splitString) {
			if (splitString[i].indexOf('=')==5 && splitString[i].indexOf('w')==0) {
				var splitVal = splitString[i].split('=');
				units = splitString[i][splitString[i].length-3]+splitString[i][splitString[i].length-2];
				w = parseFloat(splitVal[1].split(units)[0].split('"')[1]);
			}
			if (splitString[i].indexOf('=')==6 && splitString[i].indexOf('h')==0) {
				var splitVal = splitString[i].split('=');
				units = splitString[i][splitString[i].length-3]+splitString[i][splitString[i].length-2];
				h = parseFloat(splitVal[1].split(units)[0].split('"')[1]);
			}
			if (w && h) {
				break;
			}
		}
		if (units=='mm' || units=='in') {
			if (!SVGprocessed) {
				SVGString.push(file);
				shape.push(paper.project.importSVG(file));
				SVGprocessed = true;
				shape[shape.length-1].position = new Point(window.innerWidth/2, window.innerHeight/2);
				shape[shape.length-1].name = 'shape';
				shapeColor.push({});
				for (j in shape[shape.length-1].children) {
					if (shape[shape.length-1].children[j].className=='Path') {
						shapeColor[shapeColor.length-1][j] = shape[shape.length-1].children[j].strokeColor;
					}
				}
				if (units=='in') {
					shape[shape.length-1].scale(inchToMM, shape[shape.length-1].position);
				}
				calProjectBounds();
				drawGrid();
			}
		} else {
			setMessage('Please set SVG units to <b>millimeters</b> or <b>inches</b>.', '#F80');
		}
		$('#loadSVG').val('');
    }
	activateDim(dimBool);
}

function processProject(e) {
    var file = e.target.result,
        results;
    if (file && file.length) {
    	$('#jointListDiv').empty();
		$('#jointProfileListDiv').empty();
		shape = [];
		joints = [];
		jointProfileList = [];
		jointMake = [];
		shapeColor = [];
		SVGString = [];
		init();
		var JSONfile = JSON.parse(file);
		
		for (var j=0; j<JSONfile.SVGString.length; j++) {
			var units = '';
			var w, h;
			var splitString = JSONfile.SVGString[j].split(' ');
			for (i in splitString) {
				if (splitString[i].indexOf('=')==5 && splitString[i].indexOf('w')==0) {
					var splitVal = splitString[i].split('=');
					units = splitString[i][splitString[i].length-3]+splitString[i][splitString[i].length-2];
					w = parseFloat(splitVal[1].split(units)[0].split('"')[1]);
				}
				if (splitString[i].indexOf('=')==6 && splitString[i].indexOf('h')==0) {
					var splitVal = splitString[i].split('=');
					units = splitString[i][splitString[i].length-3]+splitString[i][splitString[i].length-2];
					h = parseFloat(splitVal[1].split(units)[0].split('"')[1]);
				}
			}
			SVGString.push(JSONfile.SVGString[j]);
			shape.push(paper.project.importSVG(JSONfile.SVGString[j]));
			shape[shape.length-1].position = new Point(window.innerWidth/2, window.innerHeight/2);
			shape[shape.length-1].name = 'shape';
			shapeColor.push({});
			for (k in shape[shape.length-1].children) {
				if (shape[shape.length-1].children[k].className=='Path') {
					shapeColor[shapeColor.length-1][k] = shape[shape.length-1].children[k].strokeColor;
				}
			}
			if (units=='in') {
				shape[shape.length-1].scale(inchToMM, shape[shape.length-1].position);
			}
			calProjectBounds();
			$('#loadSVG').val('');
			activateDim(dimBool);
		}
		
		jointProfileCount = JSONfile.jointProfileCount;
		var jointProfileCountTemp = jointProfileCount - JSONfile.jointProfileList.length;
		for (var i=0; i<JSONfile.jointProfileList.length; i++) {
			var id = 'joint_'+(jointProfileCountTemp);
			jointProfileList.push(JSONfile.jointProfileList[i]);
			createJointProfileMenu((jointProfileList.length-1), jointProfileCountTemp, id);
			jointProfileCountTemp++;
		}

		for (var i=0; i<JSONfile.joints.length; i++) {
			var jointDetail = JSONfile.joints[i];
			joints.push(JSONfile.joints[i]);
			initJoint(jointDetail[0].shape, jointDetail[0].path);
			initJoint(jointDetail[1].shape, jointDetail[1].path);
			if (jointDetail.revA==-1) {
				shape[jointDetail[0].shape].children[jointDetail[0].path].reverse();
			}
			if (jointDetail.revB==-1) {
				shape[jointDetail[1].shape].children[jointDetail[1].path].reverse();
			}
			generateJoint(joints.length-1);
			generateJointLines();
			displayJointLines();
			jointMake = [];
			tempLines.removeChildren();
		}

		refreshJointList();

		for (i in joints) {
			generateJoint[i];
		}
		jointLines.removeChildren();
		refreshShapeDisplay();
    }
    drawGrid();
}

function processJointProfile(e) {
	var file = e.target.result,
    results;
    if (file && file.length) {
    	var JSONfile = JSON.parse(file);
    	var bool = false;
    	for (i in jointType) {
    		if (jointType[i]['name']===JSONfile['name']) {
    			bool = true;

    			JSONfile.profile = JSONfile.name+' '+jointProfileCount;
				jointProfileCount++;
				jointProfileList.push(JSONfile);
				var activeOption = $('#jointTypeDiv .dropdownSelected').find('div')[0].id;
				var activeOptionStr = activeOption.split('_');
				var id = 'joint_'+(jointProfileCount-1);
				console.log(id);
				createJointProfileMenu((jointProfileList.length-1), jointProfileCount-1, id);
				refreshJointList();

    			break;
    		}
    	}
    	if (!bool) {
    		setMessage('<b>Joint Profile not found.</b>', '#F80');
    	}
    }
}

var shapeSelected = -1;
var mode = 'arrange';
function highlightShapeBounds() {
	var bool = false;
	if (insideMenu) {
		cursorIcon.strokeColor = new Color(0, 0);
	} else {
		cursorIcon.strokeColor = '#000';
	}
	for (i in shape) {
		if (shape[i].strokeBounds.contains(cursorPt)) {
			switch (mode) {
				case 'arrange':
					if (!moving) {
						shape[i].bounds.selected = true;
						shapeSelected = parseInt(i);
						bool = true;
						$('body').css('cursor', 'move');
					}
					break;
				case 'remove':
					shape[i].strokeColor = '#F00';
					shapeSelected = parseInt(i);
					bool = true;
					break;
			}
		} else {
			$('body').css('cursor', 'default');
			shape[i].bounds.selected = false;
			//shape[i].strokeColor = '#000';
		}
		if (bool) {
			cursorIcon.strokeColor = '#F00';
			break;
		}
	}
	if (!bool && !moving) {
		shapeSelected = -1;
		refreshShapeDisplay();
	}
}

var pathSelected = {'shape':-1, 'path':-1};
var joints = [];
var jointMake = [];
function highlightShapePath() {
	var bool = false;
	for (i in shape) {
		for (j in shape[i].children) {
			if (shape[i].children[j].className=='Path' && shape[i].children[j].name!='joint') {
				var pt = shape[i].children[j].getNearestLocation(cursorPt);
				var d = pt.getDistance(cursorPt);
				if (d < tolerance) {
					if (!bool) {
						shape[i].children[j].strokeWidth = 1.5;
						shape[i].children[j].strokeColor = '#0AF';
						pathSelected.shape = i;
						pathSelected.path = j;
						bool = true;
					} else {
						shape[i].children[j].strokeWidth = 0.5;
						shape[i].children[j].strokeColor = shapeColor[i][j];
					}
				} else {
					shape[i].children[j].strokeWidth = 0.5;
					shape[i].children[j].strokeColor = shapeColor[i][j];
				}
				if (bool) {
					break;
				}
			}
		}
		if (bool) {
			break;
		}
	}
	if (!bool) {
		pathSelected = {'shape':-1, 'path':-1};
	}
}

function checkPathJoint(s, p) {
	var type = 'noJoint';
	for (i in joints) {
		for (j in joints[i]) {
			if (joints[i][j].shape==s && joints[i][j].path==p) {
				type = 'joint';
			}
		}
	}
	if (type != 'joint' && jointMake.length>0) {
		if (jointMake[0].shape==s && jointMake[0].path==p) {
			type = 'jointMake';
		}
	}
	return type;
}

function shapePathClick() {
	if (pathSelected.shape > -1 && pathSelected.path > -1) {
		if (checkPathJoint(pathSelected.shape, pathSelected.path)=='noJoint') {
			if (jointMake.length<2) {
				jointMake.push($.extend(true,{},pathSelected));
				tempLines.addChild(shape[pathSelected.shape].children[pathSelected.path].clone());
				tempLines.strokeColor = "#0AF";
				tempLines.strokeWidth = 3;
			}
			if (jointMake.length==2) {
				var delta = shape[jointMake[0].shape].children[jointMake[0].path].length / shape[jointMake[1].shape].children[jointMake[1].path].length;
				if (delta < 1.01 && delta > 0.99) {
					var jointDetail = {'0':jointMake[0], '1':jointMake[1], 'profile':'none', 'm':0, 'f':1, 'dirM':1, 'dirF':-1, 'revA': 1, 'revB': 1};
					joints.push(jointDetail);
					initJoint(jointDetail[0].shape, jointDetail[0].path);
					initJoint(jointDetail[1].shape, jointDetail[1].path);
					generateJoint(joints.length-1);
					generateJointLines();
					displayJointLines();
					jointMake = [];
					tempLines.removeChildren();
					setMessage('<b>Joint created</b>', '#5D0');
					refreshJointList();
				} else {
					setMessage('<b>Cannot join</b>: paths have significantly different lengths', '#F80');
					jointMake = [];
					tempLines.removeChildren();
				}	
			}
		} else {
			jointMake = [];
			tempLines.removeChildren();
		}
	} else {
		jointMake = [];
		tempLines.removeChildren();
	}
}

function generateJointLines() {
	jointLines.removeChildren();
	var count = 0;
	for (i in joints) {
		var endPt = [];
		for (j in joints[i]) {
			if (j=='0' || j=='1') {
				jointLines.addChild(shape[joints[i][j].shape].children[joints[i][j].path].clone());
				jointLines.children[count].name = 'edge';
				endPt.push(jointLines.children[count].firstSegment.point);
				endPt.push(jointLines.children[count].lastSegment.point);
				count++;
			}
		}
		var path1 = new Path([endPt[0], endPt[2]]);
		var path2 = new Path([endPt[1], endPt[3]]);
		jointLines.addChild(path1);
		jointLines.children[count].name = 'connection';
		count++;
		jointLines.addChild(path2);
		jointLines.children[count].name = 'connection';
		count++;
	}
}

function displayJointLines() {
	for (i in jointLines.children) {
		if (jointLines.children[i].name=='edge') {
			jointLines.children[i].strokeColor = '#0F0';
			jointLines.children[i].strokeWidth = 1.5;
		}
		if (jointLines.children[i].name=='connection') {
			jointLines.children[i].strokeColor = '#222';
			jointLines.children[i].strokeWidth = 0.3;
			jointLines.children[i].dashArray = [2, 2];
		}
	}
}

function removeShape() {
	if (shapeSelected > -1 && shape.length > 0) {
		
		for (var i=0; i<joints.length; i++) {
			for (j in joints[i]) {
				if (j=='0' || j=='1') {
					if (joints[i][j].shape == shapeSelected) {
						removeJoint(joints[i][0].shape, joints[i][0].path);
						removeJoint(joints[i][1].shape, joints[i][1].path);
						joints.splice(i, 1);
						i--;
						break;
					}
				}
			}
		}
		shape[shapeSelected].remove();
		shape.splice(shapeSelected, 1);
		
		for (var i=0; i<joints.length; i++) {
			for (j in joints[i]) {
				if (j=='0' || j=='1') {
					if (joints[i][j].shape > shapeSelected) {
						joints[i][j].shape--;
					}
				}
			}
		}

		refreshJointList();
	}
}

var projectBounds = {'minX':0, 'maxX':0, 'minY':0, 'maxY':0};
function calProjectBounds() {
	if (shape.length > 0) {
		var corners = [];
		for (i in shape) {
			var rect = shape[i].bounds;
			corners.push({'x':rect.x, 'y':rect.y});
			corners.push({'x':rect.x+rect.width, 'y':rect.y+rect.height});
		}
		corners.sort(function(a, b) {
			return a.x - b.x;
		});
		projectBounds.minX = corners[0].x;
		projectBounds.maxX = corners[corners.length-1].x;
		corners.sort(function(a, b) {
			return a.y - b.y;
		});
		projectBounds.minY = corners[0].y;
		projectBounds.maxY = corners[corners.length-1].y;
	}
}

function checkObjectClass(obj) {
	var s = obj.toString();
	var sArr = s.split(' ');
	return sArr[0];
}

var messageCounter = 0;
function setMessage(s, c) {
	var id = 'message'+messageCounter;
	var html = '<p id="'+id+'">'+s+'</p>'
	$('#topMessage').prepend(html);
	$('#'+id).css('color', c);
	messageCounter++;
	setTimeout(function(){
		$('#'+id).fadeOut(500, function() { $(this).remove(); });
	}, 4000);
}



function refreshShapeDisplay() {
	for (i in shape) {
		for (j in shape[i].children) {
			shape[i].children[j].strokeWidth = 0;
			shape[i].children[j].strokeCap = 'round';
			if (shape[i].children[j].className=='Path') {
				shape[i].children[j].strokeColor = shapeColor[i][j];
				if (shape[i].children[j].name=='joint') {
					shape[i].children[j].strokeWidth = 0;
				} else {
					shape[i].children[j].strokeWidth = 0.5;
				}
			} else if (shape[i].children[j].className=='Group') {
				shape[i].children[j].strokeWidth = 0.5;
				if (shape[i].children[j].children['folds']) {
					shape[i].children[j].children['folds'].strokeColor = '#AAA';
				}
			}
		}
	}
	paper.view.draw();
}

var dimBool = false;
function activateDim(bool) {
	for (i in shape) {
		for (var j=0; j<shape[i].children.length; j++) {
			if (shape[i].children[j].className=='PointText') {
				shape[i].children[j].remove();
				j--;
			}
		}
		if (bool) {
			var textW = new PointText(new Point(shape[i].bounds.x+shape[i].bounds.width/2, shape[i].bounds.y-20));
			var textH = new PointText(new Point(shape[i].bounds.x+shape[i].bounds.width+20, shape[i].bounds.y+shape[i].bounds.height/2));
			textW.justification = 'center';
			textW.fillColor = 'black';
			textWStr = docUnits=='mm' ? shape[i].bounds.width : shape[i].bounds.width/inchToMM;
			textW.content = 'w '+textWStr.toFixed(2)+'';
			textH.justification = 'left';
			textH.fillColor = 'black';
			textHStr = docUnits=='mm' ? shape[i].bounds.height : shape[i].bounds.height/inchToMM;
			textH.content = 'h '+textHStr.toFixed(2)+'';
			textH.rotate(90);
			shape[i].addChild(textW);
			shape[i].addChild(textH);
		}
	}
}

function saveProject() {
	var state = {
		'SVGString' : [],
		'joints' : [],
		'jointProfileList' : [],
		'jointProfileCount' : jointProfileCount
	};
	for (i in SVGString) {
		state.SVGString.push( SVGString[i] );
	}
	for (i in joints) {
		state.joints.push( $.extend(true,{},joints[i]) );
	}
	for (i in jointProfileList) {
		state.jointProfileList.push( $.extend(true,{},jointProfileList[i]) );
	}
	var saveText = JSON.stringify(state);
	var blob = new Blob([saveText], {type: "text/plain;charset=utf-8"});
	var d = new Date();
	saveAs(blob, 'joinery_save_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds()+'.joinery');
}