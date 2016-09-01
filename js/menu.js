var insideDropdown = false;

function initForms() {
	$('#loadSVG').change(function() {
		if (this.files.length) {
			var file = this.files[0];
			var reader = new FileReader();
			var filename = file.name;
			var ext = filename.split('.');
			var name = ext[0];
			if (ext[ext.length-1]=='svg' || ext[ext.length-1]=='SVG') {
				reader.readAsText(file);
				SVGprocessed = false;
				$(reader).on('load', processSVG);
			} else {
				setMessage('<b>Invalid SVG</b>', 'F80');
			}
		} else {

		} 
	});

	$('#loadProject').change(function() {
		if (this.files.length) {
			var file = this.files[0];
			var reader = new FileReader();
			var filename = file.name;
			var ext = filename.split('.');
			var name = ext[0];
			if (ext[ext.length-1]=='joinery') {
				reader.readAsText(file);
				$(reader).on('load', processProject);
			} else {
				setMessage('<b>Invalid Joinery file</b>', 'F80');
			}
		} else {

		} 
	});

	$('#loadJointProfile').change(function() {
		if (this.files.length) {
			var file = this.files[0];
			var reader = new FileReader();
			var filename = file.name;
			var ext = filename.split('.');
			if (ext[ext.length-1]=='joint') {
				reader.readAsText(file);
				$(reader).on('load', processJointProfile);
			} else {
				setMessage('<b>Invalid Joint Profile</b>', 'F80');
			}
		} else {
			
		} 
	});

	$('#leftMenuCollapse').on('click', function() {
		$('#leftMenu').toggleClass('active');
		if ($('#leftMenu').hasClass('active')) {
			$('#leftMenuCollapse').html('\u2039');
		} else {
			$('#leftMenuCollapse').html('\u203a');
		}
	});

	$('#rightMenuCollapse').on('click', function() {
		$('#rightMenu').toggleClass('active');
		if ($('#rightMenu').hasClass('active')) {
			$('#rightMenuCollapse').html('\u203a');
		} else {
			$('#rightMenuCollapse').html('\u2039');
		}
	});

	$('#rightMenuCollapse2').on('click', function() {
		$('#rightMenu2').toggleClass('active');
		if ($('#rightMenu2').hasClass('active')) {
			$('#rightMenuCollapse2').html('\u203a');
		} else {
			$('#rightMenuCollapse2').html('\u2039');
		}
	});
	
	$('#arrangeClick').on('click', arrangeClick);
	$('#removeClick').on('click', removeClick);
	$('#setClick').on('click', setClick);
	$('#panClick').on('click', panClick);
	
	$( '#leftMenu' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '#leftMenu' ).mouseleave(function() {
		insideMenu = false;
	});
	
	$( '#rightMenu' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '#rightMenu' ).mouseleave(function() {
		insideMenu = false;
	});
	
	$( '#rightMenu2' ).mouseenter(function() {
		insideMenu = true;
	});
	$( '#rightMenu2' ).mouseleave(function() {
		insideMenu = false;
	});
	
	var selectList = '';
	for (i in jointType) {
		if (i=='0') {
			$('#jointTypeDiv .dropdown .dropdownSelected').html('<div class="dropdownOption" id="jointType_'+i+'">'+jointType[i].name+'</div>');
		}
		selectList = selectList+'<div class="dropdownOption" id="jointType_'+i+'">'+jointType[i].name+'</div>';
	}
	$('#jointTypeDiv .dropdown .optionsDiv').html(selectList);

	$('#jointTypeDiv .dropdown').on('mouseenter', function() {
		insideDropdown = true;
	});
	$('#jointTypeDiv .dropdown').on('mouseleave', function() {
		insideDropdown = false;
	});

	$('#jointTypeDiv .dropdown .dropdownSelected').on('click', function() {
		$('#jointTypeDiv .dropdown .optionsDiv .dropdownOption').toggleClass('show');
	});

	$('#jointTypeDiv .dropdown .optionsDiv .dropdownOption').on('click', function() {
		var copy = $(this).clone();
		$('#jointTypeDiv .dropdown .dropdownSelected').html(copy);
		$('#jointTypeDiv .dropdown .optionsDiv .dropdownOption').toggleClass('show');
	});

	$('#jointTypeDiv .dropdown .optionsDiv .dropdownOption').on('mouseenter', function(){
		var thisId = this.id;
		var thisIdStr = thisId.split('_');
		var index = parseInt(thisIdStr[1]);
		if (index<jointType.length-1) {
			if (index < 9) {
				$('#jointImageDiv').html('<img src="images/jointType-0'+(index+1)+'.svg">');
			} else {
				$('#jointImageDiv').html('<img src="images/jointType-'+(index+1)+'.svg">');
			}
			//$('#jointImageDiv').css('top', $(this).position().top+29+'px');
			$('#jointImageDiv').css('display', 'block');
		}
	});
	$('#jointTypeDiv .dropdown .optionsDiv .dropdownOption').on('mouseleave', function(){
		$('#jointImageDiv').css('display', 'none');
	});

	
	$('#unitMM').prop('checked', true);
	
	$('#unitMM').on('click', function() {
		$('#unitMM').prop('checked', true);
		$('#unitIn').prop('checked', false);
		docUnits = 'mm';
		for (j in jointProfileList) {
			var idStr = jointProfileList[j].profile.split(' ');
			var id = 'joint_'+idStr[idStr.length-1];
			for (i in jointProfileList[j].param) {
				$('#'+id+' input[name="'+i+'"]').val(jointProfileList[jointProfileList.length-1].param[i]);
			}
		}
		drawGrid();
		activateDim(dimBool);
	});
	
	$('#unitIn').on('click', function() {
		$('#unitIn').prop('checked', true);
		$('#unitMM').prop('checked', false);
		docUnits = 'in';
		for (j in jointProfileList) {
			var idStr = jointProfileList[j].profile.split(' ');
			var id = 'joint_'+idStr[idStr.length-1];
			for (i in jointProfileList[j].param) {
				$('#'+id+' input[name="'+i+'"]').val(jointProfileList[jointProfileList.length-1].param[i]/inchToMM);
			}
		}
		drawGrid();
		activateDim(dimBool);
	});
	
	$('#dimOn').on('click', function() {
		if ($('#dimOn').is(':checked')) {
			dimBool = true;
		} else {
			dimBool = false;
		}
		activateDim(dimBool);
	});
}

function arrangeClick() {
	$('#leftMenu li.active').toggleClass('active');
	$('#arrangeClick').toggleClass('active');
	mode = 'arrange';
	rememberMode = '';
	$('body').css('cursor', 'default');
	emptyAll();
}

function removeClick() {
	$('#leftMenu li.active').toggleClass('active');
	$('#removeClick').toggleClass('active');
	mode = 'remove';
	rememberMode = '';
	$('body').css('cursor', 'default');
	emptyAll();
	createRemoveIcon();
}

function createRemoveIcon() {
	cursorIcon.removeChildren();
	cursorIcon.position = cursorPt;
	var path1 = new Path([cursorIcon.position.subtract(new Point(-25, -25)), cursorIcon.position.subtract(new Point(25, 25))]);
	var path2 = new Path([cursorIcon.position.subtract(new Point(-25, 25)), cursorIcon.position.subtract(new Point(25, -25))]);
	cursorIcon.addChildren([path1, path2]);
	cursorIcon.strokeWidth = 1;
	cursorIcon.strokeColor = '#000';
}

function setClick() {
	$('#leftMenu li.active').toggleClass('active');
	$('#setClick').toggleClass('active');
	mode = 'set';
	rememberMode = '';
	$('body').css('cursor', 'default');
	emptyAll();
	generateJointLines();
	displayJointLines();
}

function panClick() {
	$('#leftMenu li.active').toggleClass('active');
	$('#panClick').toggleClass('active');
	mode = 'pan';
	rememberMode = '';
	$('body').css('cursor', '-webkit-grab');
	emptyAll();
}

function emptyAll() {
	cursorIcon.removeChildren();
	jointLines.removeChildren();
	tempLines.removeChildren();
	highlight.removeChildren();
	for (i in shape) {
		shape[i].bounds.selected = false;
		shape[i].strokeWidth = 1;
		shape[i].strokeColor = '#000';
	}
	refreshShapeDisplay();
}

function createJointProfileMenu(i, ic, id) {
	var html = '<div class="jointProfile" id="joint_'+ic+'">';
	html = html+'<div class="title">'+jointProfileList[i].profile+'<b>delete</b></div>';
	html = html+'<div class="paramList">';
	html = html+'<div class="jointNotes"><textarea>'+jointProfileList[i].notes+'</textarea>';
	html = html+'</div>';
	for (j in jointProfileList[i].param) {
		html = html+'<li class="param"><label>'+j+'</label><input type="number" name="'+j+'"></li>';
	}
	html = html+'<li class="saveProfile" id="save-'+id+'"><label>save profile</label></li>';
	html = html+'<li class="setVal" id="set-'+id+'"><label>set values</label></li>';
	html = html+'</div>'
	html = html+'</div>'
	$('#jointProfileListDiv').append(html);
	
	$('#'+id+' .title').on('click', function() {
		$('#'+id+' .paramList').toggleClass('active');
	});
	
	$('#'+id+' .title b').on('click', function() {	
		var idString = $('#'+id).attr('id');
		var idVal = idString.split('_');
		idVal = parseInt(id[id.length-1]);
		for (j in jointProfileList) {
			var str = jointProfileList[j].profile;
			var strSplit = str.split(' ');
			if (idVal==parseInt(strSplit[strSplit.length-1])) {
				jointProfileList.splice(j, 1);
				break;
			}
		}
		$('#'+id).remove();
		
		for (j in joints) {
			generateJoint(j);
		}
		
		refreshJointList();
	});
	
	$('#'+id+' .setVal').on('click', function() {
		var idString = $(this).attr('id');
		var idVal = idString.split('_');
		idVal = parseInt(id[id.length-1]);
		for (j in jointProfileList) {
			var str = jointProfileList[j].profile;
			var strSplit = str.split(' ');
			jointProfileList[j]['notes'] = $('#'+id+' .jointNotes textarea').val();
			if (idVal==parseInt(strSplit[strSplit.length-1])) {
				for (k in jointProfileList[j].param) {
					var val = $('#'+id+' input[name="'+k+'"]').val();
					if (!isNaN(val)) {
						if (docUnits=='mm') {
							jointProfileList[j].param[k] = parseFloat(val);
						} else {
							jointProfileList[j].param[k] = parseFloat(val)*inchToMM;
						}
					}
				}
				break;
			}
		}
				
		for (j in joints) {
			generateJoint(j);
		}
	});

	$('#'+id+' .saveProfile').on('click', function() {
		var idString = $(this).attr('id');
		var idVal = idString.split('_');
		idVal = parseInt(id[id.length-1]);
		for (j in jointProfileList) {
			var str = jointProfileList[j].profile;
			var strSplit = str.split(' ');
			if (idVal==parseInt(strSplit[strSplit.length-1])) {
				jointProfileList[j]['notes'] = $('#'+id+' .jointNotes textarea').val();
				var saveText = JSON.stringify(jointProfileList[j]);
				var blob = new Blob([saveText], {type: "text/plain;charset=utf-8"});
				var d = new Date();
				saveAs(blob, 'joint_profile_'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'_'+d.getHours()+'.'+d.getMinutes()+'.'+d.getSeconds()+'.joint');
			}
		}
	});
	
	for (j in jointProfileList[i].param) {
		if (docUnits=='mm') {
			$('#'+id+' input[name="'+j+'"]').val(jointProfileList[i].param[j]);
		} else {
			$('#'+id+' input[name="'+j+'"]').val(jointProfileList[i].param[j]/inchToMM);
		}
	}
}

function addJointProfile() {
	var activeOption = $('#jointTypeDiv .dropdownSelected').find('div')[0].id;
	var activeOptionStr = activeOption.split('_');
	var index = parseInt(activeOptionStr[1]);
	var id = 'joint_'+(jointProfileCount);
	createJointProfile(index);
	createJointProfileMenu((jointProfileList.length-1), jointProfileCount-1, id);
	
	refreshJointList();
}

function refreshJointList() {
	$('#jointListDiv').empty();
	for (i in joints) {
		var index = i;
		var jID = index+'_'+joints[i]['0'].shape+'-'+joints[i]['0'].path+'_'+joints[i]['1'].shape+'-'+joints[i]['1'].path;
		var html = '<div id="joint_'+jID+'" class="jointItem">';
		html = html+'<div class="title">joint '+jID+'<b>delete</b></div>';
		html = html+'<div class="jointOptions">';
		html = html+'<select>';
		for (i in jointProfileList) {
			html = html+'<option value="'+jointProfileList[i].profile+'">'+jointProfileList[i].profile+'</option>';
		}
		html = html+'<option value="none">none</option></select>';
		html = html+'<div class="optionButton swapMF">swap M/F</div><div class="optionButton revM">reverse M</div><div class="optionButton revF">reverse F</div><div class="optionButton2 flipM">flip M</div><div class="optionButton2 flipF">flip F</div>';
		html = html+'</div>';
		html = html+'</div>';
		$('#jointListDiv').append(html);
		
		var bool = false;
		$('#joint_'+jID+' .jointOptions select > option').each(function () {
			if ($(this).val()==joints[index].profile) {
				$(this).prop('selected', true);
				bool = true;
			}
		});
		if (!bool) {
			$('#joint_'+jID+' .jointOptions select option[value="none"]').prop('selected', true);
		}
		
		
	}
	
	$('.jointItem').each(function(){
		var index = $(this).attr('id').split('_');
		var shapeA = parseInt(index[2].split('-')[0]);
		var pathA = parseInt(index[2].split('-')[1]);
		var shapeB = parseInt(index[3].split('-')[0]);
		var pathB = parseInt(index[3].split('-')[1]);
		var id = parseInt($(this).attr('id').split('_')[1]);
		$(this).find('select').on('change', function() {
			joints[id].profile = $(this).find('option:selected').val();
			generateJoint(id);			
		});
		$(this).find('.swapMF').on('click', function() {
			joints[id].m = (joints[id].m+1)%2;
			joints[id].f = (joints[id].f+1)%2;
			joints[id].dirM = joints[id].dirM*-1;
			joints[id].dirF = joints[id].dirF*-1;
			generateJoint(id);			
		});
		$(this).find('.flipM').on('click', function() {
			joints[id].dirM = joints[id].dirM*-1;
			generateJoint(id);			
		});
		$(this).find('.flipF').on('click', function() {
			joints[id].dirF = joints[id].dirF*-1;
			generateJoint(id);		
			console.log(joints[id]);	
		});
		$(this).find('.revM').on('click', function() {
			if (joints[id].m==0) {
				shape[shapeA].children[pathA].reverse();
				joints[id].revA = joints[id].revA*-1;
			} else {
				shape[shapeB].children[pathB].reverse();
				joints[id].revB = joints[id].revB*-1;
			}
			if (mode=='set') {
				generateJointLines();
				displayJointLines();
			}
			generateJoint(id);			
		});
		$(this).find('.revF').on('click', function() {
			if (joints[id].f==0) {
				shape[shapeA].children[pathA].reverse();
				joints[id].revA = joints[id].revA*-1;
			} else {
				shape[shapeB].children[pathB].reverse();
				joints[id].revB = joints[id].revB*-1;
			}
			if (mode=='set') {
				generateJointLines();
				displayJointLines();
			}
			generateJoint(id);			
		});
		$(this).find('.title').on('click', function() {
			$(this).parent().find('.jointOptions').toggleClass('active');
		});
		$(this).find('.title').find('b').on('click', function() {
			removeJoint(shapeA, pathA);
			removeJoint(shapeB, pathB);
			joints.splice(id, 1);
			$(this).parent().parent().remove();
			highlight.removeChildren();
			if (mode=='set') {
				generateJointLines();
				displayJointLines();
			}
			refreshJointList();
		});
		$(this).find('.title').on('mouseenter', function() {
			highlight.removeChildren();
			highlight.addChild(shape[shapeA].children[pathA+'_joint'].clone());
			highlight.addChild(shape[shapeB].children[pathB+'_joint'].clone());
			highlight.strokeColor = '#0AF';
			highlight.strokeWidth = 3;
		});
		$(this).find('.title').on('mouseleave', function() {
			highlight.removeChildren();
		});
	})
}