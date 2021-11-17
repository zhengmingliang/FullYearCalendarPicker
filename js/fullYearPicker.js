(function () {
    //记录当前选中的日期
    var fullYearPicker_nowSelect = null;
    var fullYearPicker_last = null;
    var _viewer_ = this;
    function tdClass(i, disabledDay, sameMonth, values, dateStr) {
        var cls = i == 5 || i == 6 ? 'weekend' : '';
        if (disabledDay && disabledDay.indexOf(i) != -1) cls += (cls ? ' ' : '') + 'disabled';
        if (!sameMonth) cls += (cls ? ' ' : '') + 'empty';
        if (sameMonth && values && cls.indexOf('disabled') == -1 && values.indexOf(',' + dateStr + ',') != -1) cls += (cls ? ' ' : '') + 'selected';
        return cls == '' ? '' : ' class="' + cls + '"';
    }

    function renderMonth(year, month, clear, disabledDay, values) {
        var d = new Date(year, month - 1, 1),
            s = '<table cellpadding="3" cellspacing="1" border="0"' + (clear ? ' class="right"' : '') + '>'
                + '<tr><th colspan="7" class="head">' + year + '年' + month + '月</th></tr>'
                + '<tr><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th class="weekend">六</th><th class="weekend">日</th></tr>';
        var dMonth = month - 1;
        var firstDay = d.getDay() - 1, hit = false; // 计算每个月第一天是星期几
        s += '<tr>';
        for (var i = 0; i < 7; i++)
            if (firstDay == i || hit) {
                s += '<td date="' + year + '-' + month + '-' + d.getDate() + '"' + tdClass(i, disabledDay, true, values, year + '-' + month + '-' + d.getDate()) + '>' + d.getDate() + '</td>';
                d.setDate(d.getDate() + 1);
                hit = true;
            } else s += '<td date=""' + tdClass(i, disabledDay, false) + '>&nbsp;</td>';
        s += '</tr>';
        for (var i = 0; i < 5; i++) {
            s += '<tr>';
            for (var j = 0; j < 7; j++) {
                var dateStr = d.getMonth() == dMonth ? year + '-' + month + '-' + d.getDate() : "";
                s += '<td date="' + dateStr + '"' + tdClass(j, disabledDay, d.getMonth() == dMonth, values, year + '-' + month + '-' + d.getDate()) + '>' + (d.getMonth() == dMonth ? d.getDate() : '&nbsp;') + '</td>';
                d.setDate(d.getDate() + 1);
            }
            s += '</tr>';
        }
        return s + '</table>' + (clear ? '<br>' : '');
    }

    function getDateStr(td) {
        return td.parentNode.parentNode.rows[0].cells[0].innerHTML.replace(/[年月]/g, '-') + td.innerHTML
    }

    function renderYear(year, el, disabledDay, value) {
        el.find('td').unbind();
        var s = '', values = ',' + value.join(',') + ',';
        for (var i = 1; i <= 12; i++) s += renderMonth(year, i, i % 4 == 0, disabledDay, values);
        el.find('div.picker').html(s).find('td').click(function () {
            if (!/disabled|empty/g.test(this.className)) $(this).toggleClass('selected');
            var dateStr = getDateStr(this);
            if (this.className.indexOf('empty') == -1 && typeof el.data('config').cellClick == 'function') {
                el.data('config').cellClick(dateStr, this.className.indexOf('disabled') != -1,this.className.indexOf("selected") != -1);
                $(".fullYearPicker td").removeClass("arrow_box");
                $(this).addClass("arrow_box");
                fullYearPicker_nowSelect = dateStr;
                _viewer_.data('config').choose(_viewer_.fullYearPicker('getSelected'));
                // if(!$("[date='"+getDateStr(this)+"']").hasClass("selected")){
                //     fullYearPicker_nowSelect = null;
                //     //$(this).removeClass("arrow_box");
                // }else{
                //     fullYearPicker_nowSelect = getDateStr(this);
                //
                // }
            }
            if (this.className != 'selected') {
                var arr = el.data('config').value;
                if(arr){
                    var split = dateStr.split("-");
                    dateStr = split[0] + "-"
                    if (split[1].length == 1) {
                        dateStr += "0" +split[1] + "-"
                    } else {
                        dateStr += split[1] + "-"
                    }
                    if (split[2].length == 1) {
                        dateStr += "0" +split[2]
                    } else {
                        dateStr += split[2]
                    }
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] == dateStr) {
                            arr.splice(i,1);
                            break;
                        }
                    }
                    el.data('config').value = arr;
                }
            }
        });
    }

    //批量选中日期
    $.fn.selectDates = function (dateArray) {
        dateArray.forEach(function (item) {
            $("[date='" + item + "']").addClass("selected");
        });
    }
    //@config：配置，具体配置项目看下面
    //@param：为方法时需要传递的参数
    $.fn.fullYearPicker = function (config, param) {
        if (config === 'setDisabledDay' || config === 'setYear' || config === 'clear' || config === 'checkAllWeekend' || config === 'clearAllWeekend' || config === 'getSelected' || config === 'getAll' || config === 'acceptChange' || config === 'setColors' || config === 'initDate') {//方法
            var me = $(this);
            if (config == 'setYear') {//重置年份
                me.data('config').year = param;//更新缓存数据年份
                me.find('div.year a:first').trigger('click', true);
            } else if (config == 'getAll') {
                // 已保存的其他年份的选中日期，和当前年份选中的日期合并后的结果
                var concat = me.data('config').value.concat(me.fullYearPicker("getSelected"));
                // 对重复数据进行去重
                return Array.from(new Set(concat));
            } else if (config == 'clear') {
                me.data('config').value =  [];
                me.data('config').initDate = [];
                me.find("td.selected").removeClass("selected")
                return true;
            } else if (config == 'checkAllWeekend') { // 选中所有的周六日
                var input = me.find(".checkbox_weekend > input");
                input.prop("checked",true);
                input.change()
                return true;
            }else if (config == 'clearAllWeekend') { // 清除选中的所有周六日
                var input = me.find(".checkbox_weekend > input");
                input.prop("checked",false);
                input.change()
                return true;
            }else if (config == 'initDate') { // 初始化日期
                if (!param) {
                    return false;
                }
                param.forEach(function (p1, p2, p3) {
                    if(newConifg.format === 'YYYY-MM-DD'){
                        var items = p1.split('-');
                        var mm = items[1];
                        if(mm[0] === '0'){
                            mm = mm[1];
                        }
                        var dd = items[2];
                        if(dd[0] === '0'){
                            dd = dd[1];
                        }
                        var item = items[0] + '-' + mm + '-' + dd;
                    }
                    $("[date='"+item+"']").addClass("selected")
                })
                me.data('config').value = Array.from(new Set(param));
                return true;
            }
            else if (config == 'getSelected') {//获取当前当前年份选中的日期集合（注意不更新默认传入的值，要更新值请调用acceptChange方法）
                return me.find('td.selected').map(function () {
                    var selectStr = getDateStr(this);
                    if(_viewer_.data('config').format === 'YYYY-MM-DD'){
                        var selects = selectStr.split('-');
                        var yy = selects[0];
                        var mm = selects[1];
                        if(Number(mm) < 10){
                            mm = '0'+mm;
                        }
                        var dd = selects[2];
                        if(Number(dd) < 10){
                            dd = '0'+dd;
                        }
                        selectStr = yy + '-' + mm + '-' + dd;
                    }
                    return selectStr;
                }).get();
            }
            else if (config == 'acceptChange') {//更新日历值，这样才会保存选中的值，更换其他年份后，再切换到当前年份才会自动选中上一次选中的值
                var concat = me.data('config').value.concat(me.fullYearPicker('getSelected'));
                me.data('config').value = Array.from(new Set(concat)).sort();
            }
            else if (config == 'setColors') {//设置单元格颜色 param格式为{defaultColor:'#f00',dc:[{d:'2017-8-2',c:'blue'}..]}，dc数组c缺省会用defaultColor代替，defaultColor也缺省默认红色
                return me.find('td').each(function () {
                    var d = getDateStr(this);
                    for (var i = 0; i < param.dc.length; i++) if (d == param.dc[i].d) this.style.backgroundColor = param.dc[i].c || param.defaultColor || '#f00';
                });
            }
            else {
                me.find('td.disabled').removeClass('disabled');
                me.data('config').disabledDay = param;//更新不可点击星期
                if (param) {
                    me.find('table tr:gt(1)').find('td').each(function () {
                        if (param.indexOf(this.cellIndex) != -1)
                            this.className = (this.className || '').replace('selected', '') + (this.className ? ' ' : '') + 'disabled';
                    });
                }
            }
            return this;
        }
        //@year:显示的年份
        //@disabledDay:不允许选择的星期列，注意星期日是0，其他一样
        //@cellClick:单元格点击事件（可缺省）。事件有2个参数，第一个@dateStr：日期字符串，格式“年-月-日”，第二个@isDisabled，此单元格是否允许点击
        //@value:选中的值，注意为数组字符串，格式如['2016-6-25','2016-8-26'.......]
        //@yearScale:配置这个年份变为下拉框，格式如{min:2000,max:2020}
        let selectValue = me && me.data('config').value;
        config = $.extend({year: new Date().getFullYear(), disabledDay: '', value:  selectValue ? selectValue :[],initDate:[],format:"",disable:false}, config);
        return this.addClass('fullYearPicker').each(function () {
            _viewer_ = $(this);
            _viewer_.html("");
            var me = $(this), year = config.year || new Date().getFullYear();
                newConifg = {
                    cellClick: config.cellClick,
                    disabledDay: config.disabledDay,
                    year: year,
                    value: config.value,
                    yearScale: config.yearScale,
                    choose:config.choose,
                    initDate:config.initDate,
                    format:config.format,
                    disable:config.disable
                };
            me.data('config', newConifg);
            console.log(newConifg)
            var selYear = '';
            if (newConifg.yearScale) {
                selYear = '<select>';
                for (var i = newConifg.yearScale.min, j = newConifg.yearScale.max; i < j; i++) selYear += '<option value="' + i + '"' + (i == year ? ' selected' : '') + '>' + i + '</option>';

                selYear += '</select>';
            }
            selYear = selYear || year;
            me.append('<div class="year"><a href="#">上一年</a>' + selYear + '年<a href="#" class="next">下一年</a> <div class="checkbox_weekend"><input type="checkbox">选中当前年份周六日</div></div><div class="picker"></div>')
                .find('a').click(function (e, setYear) {
                if (setYear) year = me.data('config').year;
                else this.innerHTML == '上一年' ? year-- : year++;
                // 切换年份时，对选择的数据进行自动保存；
                me.fullYearPicker('acceptChange');
                // 切换年份时，勾选周末的复选框默认去除
                me.fullYearPicker('clearAllWeekend');

                me.find('select').val(year);
                renderYear(year, $(this).closest('div.fullYearPicker'), newConifg.disabledDay, newConifg.value);
                if (newConifg.value) {
                    newConifg.value.forEach(function (item) {
                        if(newConifg.format === 'YYYY-MM-DD'){
                            var items = item.split('-');
                            var mm = items[1];
                            if(mm[0] === '0'){
                                mm = mm[1];
                            }
                            var dd = items[2];
                            if(dd[0] === '0'){
                                dd = dd[1];
                            }
                            item = items[0] + '-' + mm + '-' + dd;
                        }
                        $("[date='"+item+"']").addClass("selected")
                    })
                }
                this.parentNode.firstChild.nextSibling.data = year + '年';
                return false;
            }).end().find(".checkbox_weekend > input").change(function () {
                var checked = $(this).prop("checked");
                if(checked){
                    me.find(".weekend[date^=2]").addClass("selected")
                } else {
                    me.find(".weekend[date^=2]").removeClass("selected")
                }
            }).end().find('select').change(function () {
                me.fullYearPicker('setYear', this.value);
            });
            if(_viewer_.data('config').disable === true){
                _viewer_.data('config').disabledDay = '0,1,2,3,4,5,6';
            }
            renderYear(year, me, newConifg.disabledDay, newConifg.value);

            if(newConifg.initDate.length > 0){
                newConifg.initDate.forEach(function (p1, p2, p3) {
                    if(newConifg.format === 'YYYY-MM-DD'){
                        var items = p1.split('-');
                        var mm = items[1];
                        if(mm[0] === '0'){
                            mm = mm[1];
                        }
                        var dd = items[2];
                        if(dd[0] === '0'){
                            dd = dd[1];
                        }
                        var item = items[0] + '-' + mm + '-' + dd;
                    }
                    $("[date='"+item+"']").addClass("selected")
                })
            }
            if(newConifg.value.length > 0){
                newConifg.value.forEach(function (p1, p2, p3) {
                    if(newConifg.format === 'YYYY-MM-DD'){
                        var items = p1.split('-');
                        var mm = items[1];
                        if(mm[0] === '0'){
                            mm = mm[1];
                        }
                        var dd = items[2];
                        if(dd[0] === '0'){
                            dd = dd[1];
                        }
                        var item = items[0] + '-' + mm + '-' + dd;
                    }
                    $("[date='"+item+"']").addClass("selected")
                })
            }
        });
    };
    //获取当前选择月的最大天数
    function getMaxDay(year, month) {
        var thisDate = new Date(year, month, 0); //当天数为0 js自动处理为上一月的最后一天
        return thisDate.getDate();
    }

    //上下左右选中
    function selectDay(type,del) {
        var day = Number(fullYearPicker_nowSelect.split("-")[2]);
        var year = fullYearPicker_nowSelect.split("-")[0];
        var month = fullYearPicker_nowSelect.split("-")[1];
        var maxDay = Number(getMaxDay(year, month)) + 1;
        if (maxDay) {
            switch (type) {
                case 38://up
                    if(day < 7 || day === 7){return}
                    day -= 7;
                    break;
                case 37://left
                    if(day === 1){return}
                    day -= 1;
                    break;
                case 40://down
                    if((day+7) > Number(maxDay) || (day+7) === Number(maxDay)){return}
                    day += 7;
                    break;
                case 39://right
                    if(day === Number(maxDay) - 1){return}
                    day += 1;
                    break;
                default:
                    break;
            }
            fullYearPicker_nowSelect = year + '-' + month + '-' + day;
            var $td = $("[date='" + fullYearPicker_nowSelect + "']");
            if(del){
                if (!$td.hasClass("empty") && !$td.hasClass("selected")) {
                    $(".fullYearPicker td").removeClass("arrow_box");
                    $td.addClass("selected").addClass("arrow_box");
                    // $(".fullYearPicker td").removeClass("arrow_box");
                    // $td.removeClass("selected").addClass("arrow_box");
                    _viewer_.data('config').choose(_viewer_.fullYearPicker('getSelected'));
                } else if (!$td.hasClass("empty") && $td.hasClass("selected")) {
                    $(".fullYearPicker td").removeClass("arrow_box");
                    $td.removeClass("selected").addClass("arrow_box");
                    _viewer_.data('config').choose(_viewer_.fullYearPicker('getSelected'));
                }
            }else{
                if (!$td.hasClass("empty")) {
                    $(".fullYearPicker td").removeClass("arrow_box");
                    $td.addClass("selected").addClass("arrow_box");
                    _viewer_.data('config').choose(_viewer_.fullYearPicker('getSelected'));
                }
            }
        }
    }

    //监听键盘上下左右  fullYearPicker_nowSelect

    document.onkeydown = function (event) {
        if(_viewer_.data('config').disabledDay !== ""){
            return;
        }
        if(fullYearPicker_nowSelect === null){return};
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode === 38 || e && e.keyCode === 37) {//上,左
            //38=上键，37=左键
            //alert(fullYearPicker_nowSelect)
            //if(!e.ctrlKey){
                if (e.keyCode === 38) {//up
                    selectDay(38,true);
                } else if (e && e.keyCode === 37) {
                    selectDay(37,true);
                }
            // }else{
            //     //组合键
            //     if (e.keyCode === 38 && e.ctrlKey) {//up
            //         selectDay(38,true);
            //     } else if (e && e.keyCode === 37 && e.ctrlKey) {
            //         selectDay(37,true);
            //     }
            // }
        }
        if (e && e.keyCode === 40 || e && e.keyCode === 39) {//下,右
            //40=下键，39=右键
            //if(!e.ctrlKey){
                if (e.keyCode === 40) {//up
                    selectDay(40,true);
                } else if (e && e.keyCode === 39) {
                    selectDay(39,true);
                }
            // }else{
            //     //组合键
            //     if (e.keyCode === 40 && e.ctrlKey) {//up
            //         selectDay(40,true);
            //     } else if (e && e.keyCode === 39 && e.ctrlKey) {
            //         selectDay(39,true);
            //     }
            // }
        }
    };
})();