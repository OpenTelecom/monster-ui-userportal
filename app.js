define(["require", "jquery", "underscore", "monster"], function(e) {
    var t = e("jquery"),
        n = e("underscore"),
        r = e("monster"),
        i = {
            name: "userportal",
            css: ["app"],
            i18n: {
                "en-US": {
                    customCss: !1
                }
            },
            userCdrRange: 7,
            requests: {},
            subscribe: {},
            load: function(e) {
                var t = this;
                t.initApp(function() {
                    e && e(t)
                })
            },
            initApp: function(e) {
                var t = this;
                r.pub("auth.initApp", {
                    app: t,
                    callback: e
                })
            },
            render: function(e) {
                var t = this;
                t.renderPortalManager(e)
            },
            renderPortalManager: function(e) {
                var n = this,
                    e = e || t("#monster-content");
                n.getUser(n.userId, function(i) {
                    i = n.formatSettings(i);
                    var s = t(r.template(n, "portal_manager", i));
                    n.refreshListDevices(s), n.setupPage(i, s), i.data.vm_to_email_enabled || t(".email-field", s).hide(), (!("call_forward" in i.data) || !i.data.call_forward.enabled) && t("#call-forward-data", s).hide(), e.empty().append(s), t(".dataTables_scrollHeadInner, .dataTables_scrollHeadInner table", s).attr("style", "width:100%")
                })
            },
            refreshListDevices: function(e) {
                var n = this,
                    i = e,
                    s = {
                        cellphone: "Cell",
                        smartphone: "Smartphone",
                        fax: "Fax",
                        sip_device: "VoIP",
                        softphone: "Softphone",
                        landline: "Landline"
                    };
                n.getRegisteredDevices(function(e) {
                    n.getUserDevices(function(o) {
                        t(".list_devices", i).html('<div class="clear"/>'), t("#device_quickcall", i).empty();
                        var u, a = {};
                        t.each(e.data, function(e, t) {
                            a[t.device_id] = !0
                        }), t.each(o.data, function(e, o) {
                            o.registered = o.id in a || t.inArray(o.device_type, ["cellphone", "smartphone", "landline"]) > -1 ? "registered" : "unregistered", u = {
                                status: o.registered,
                                name: o.name,
                                device_type: o.device_type,
                                friendly_type: s[o.device_type],
                                id: o.id
                            }, o.registered === "registered" && t("#device_quickcall", i).append('<option value="' + o.id + '">' + o.name + "</option>"), t(".list_devices", i).prepend(r.template(n, "device_line", u))
                        })
                    })
                })
            },
            setupPage: function(e, n) {
                var r = this,
                    i = n,
                    s = i.find("#call-forward-data"),
                    o = i.find(".email-field");
                t("#ring-number-txt", i).on("keyup", function() {
                    i.find("#ring-device-checkbox").prop("checked", t(this).val() !== "")
                }), t("#vm-to-email-checkbox", i).on("change", function() {
                    t(this).prop("checked") ? o.slideDown() : o.slideUp()
                }), t("#call-forward-enabled", i).on("change", function() {
                    t(this).prop("checked") ? s.slideDown() : s.slideUp()
                }), t("#save-settings-link", i).click(function(n) {
                    n.preventDefault();
                    var s = t("#ring-number-txt", i).val();
                    s.match(/^[\+]?[0-9\s\-\.\(\)]{7,20}$/) && (s = s.replace(/\s|\(|\)|\-|\./g, ""));
                    var o = t("#call-forward-enabled", i).prop("checked"),
                        u = {
                            vm_to_email_enabled: !1,
                            call_forward: {
                                number: s,
                                enabled: o && s !== "" ? !0 : !1,
                                substitute: !t("#ring-device-checkbox", i).prop("checked"),
                                keep_caller_id: t("#call_forward_keep_caller_id", i).prop("checked")
                            }
                        };
                    t("#vm-to-email-checkbox", i).prop("checked") && (u.vm_to_email_enabled = !0, u.email = t("#vm-to-email-txt", i).val());
                    var a = t.extend(!0, {}, e.data, u);
                    a = r.normalizeUserData(a), r.updateUser(a, function() {
                        r.renderPortalManager()
                    })
                }), t("#contact_list_btn", i).click(function(e) {
                    e.preventDefault(), r.popup_contact_list()
                }), r.setupVoicemailTable(n), r.setupCdrTable(n), r.setupContactListTable(n)
            },
            normalizeUserData: function(e) {
                return e.call_forward.number === "" && delete e.call_forward.number, e
            },
            formatSettings: function(e) {
                var t = this;
                return e.data.hasOwnProperty("call_forward") || (e.data.call_forward = {}), e
            },
            setupVoicemailTable: function(e) {
                var n = this,
                    i = [{
                        sTitle: '<input type="checkbox" id="select_all_voicemails"/>',
                        sWidth: "40px",
                        bSortable: !1,
                        fnRender: function(e) {
                            var t = e.aData[e.iDataColumn];
                            return '<input type="checkbox" class="select-checkbox" msg_uri="' + t + '"/>'
                        }
                    }, {
                        sTitle: "messageIndex",
                        bSearchable: !1,
                        bVisible: !1
                    }, {
                        sTitle: "vmboxId",
                        bSearchable: !1,
                        bVisible: !1
                    }, {
                        sTitle: n.i18n.active().userportal.date,
                        sWidth: "250px",
                        iDataSort: 7
                    }, {
                        sTitle: n.i18n.active().userportal.caller_id,
                        sWidth: "200px"
                    }, {
                        sTitle: n.i18n.active().userportal.status,
                        sWidth: "180px"
                    }, {
                        sTitle: n.i18n.active().userportal.download,
                        bSortable: !1,
                        sWidth: "20px",
                        fnRender: function(e) {
                            var t = e.aData[e.iDataColumn];
                            return '<a href="' + n.formatVMURI(t) + '"><span class="fa fa-download" alt="Download"/></a>'
                        }
                    }, {
                        sTitle: n.i18n.active().userportal.download,
                        bSortable: !1,
                        sWidth: "20px",
                        fnRender: function(e) {
                            var t = e.aData[e.iDataColumn];
                            return '<audio controls="" src="' + n.formatVMURI(t) + '"></audio>'
                        }
                    }, {
                        sTitle: "timestamp",
                        bSearchable: !1,
                        bVisible: !1
                    }];
                r.ui.table.create("voicemail", t("#voicemail-grid", e), i, {}, {
                    sDom: '<"actions_voicemail">frtlip',
                    sScrollY: "150px",
                    aaSorting: [
                        [3, "desc"]
                    ]
                }), t.fn.dataTableExt.afnFiltering.pop(), t("div.actions_voicemail", e).html('<button id="new-voicemail-link" class="monster-button monster-button-primary" data-action="new">' + n.i18n.active().userportal.mark_as_new + '</button><button id="save-voicemail-link" class="monster-button monster-button-success" data-action="saved">' + n.i18n.active().userportal.mark_as_saved + '</button><button id="delete-voicemail-link" class="monster-button monster-button-danger" data-action="deleted">' + n.i18n.active().userportal.delete + "</button>"), t("#save-voicemail-link, #delete-voicemail-link, #new-voicemail-link", e).click(function(i) {
                    i.preventDefault();
                    var s, o = t(this).data("action");
                    if (t(".select-checkbox:checked", e).size()) {
                        var u = function() {
                            s = {}, t(".select-checkbox:checked", e).each(function() {
                                var e = t(this).parents("tr")[0],
                                    n = r.ui.table.voicemail.fnGetData(e, 2);
                                s[n] ? s[n].push(e) : s[n] = [e]
                            }), t.each(s, function(i, s) {
                                n.getVmbox(i, function(i) {
                                    var u;
                                    if (i.data.messages == undefined) return !1;
                                    t.each(s, function(e, n) {
                                        u = r.ui.table.voicemail.fnGetData(n, 1), t.inArray(o, ["saved", "deleted", "new"]) > -1 && (i.data.messages[u].folder = o)
                                    }), n.updateVmbox(i, function() {
                                        t.each(s, function(e, n) {
                                            t.inArray(o, ["saved", "new"]) > -1 ? r.ui.table.voicemail.fnUpdate(o, n, 5) : o == "deleted" && r.ui.table.voicemail.fnDeleteRow(n)
                                        }), t(".select-checkbox, #select_all_voicemails", e).prop("checked", !1)
                                    })
                                })
                            })
                        };
                        o === "delete" ? r.ui.confirm(n.i18n.active().userportal.are_you_sure_that_you_want_to_delete, function() {
                            u()
                        }) : u()
                    }
                }), t("#select_all_voicemails", e).change(function() {
                    t(".select-checkbox", e).prop("checked", t(this).is(":checked"))
                }), n.getVmboxByOwner(n.userId, function(i) {
                    if (i.data.length > 0) {
                        var s = i.data[0].id;
                        n.getVmbox(s, function(n) {
                            if (n.data.messages) {
                                var i = [];
                                t.each(n.data.messages, function(e, t) {
                                    if (this.folder != "deleted") {
                                        var n = t.media_id,
                                            o = s + "/messages/" + n,
                                            u = new Date((t.timestamp - 62167219200) * 1e3),
                                            a = u.getMonth() + 1,
                                            f = u.getFullYear() % 100,
                                            l = u.getDate(),
                                            c = a + "/" + l + "/" + f,
                                            h = u.toLocaleTimeString(),
                                            p = c + " " + h;
                                        p = r.util.toFriendlyDate(t.timestamp), i.push(["0", e, s, p, t.caller_id_number, t.folder, o, o, t.timestamp])
                                    }
                                }), r.ui.table.voicemail.fnAddData(i), t(".dataTables_scrollHeadInner, .dataTables_scrollHeadInner table", e).attr("style", "width:100%")
                            }
                        })
                    }
                })
            },
            setupCdrTable: function(e) {
                var n = e,
                    i = this,
                    s = i.userCdrRange,
                    o = [{
                        sTitle: i.i18n.active().userportal.date,
                        sWidth: "250px"
                    }, {
                        sTitle: i.i18n.active().userportal.from_caller_id,
                        sWidth: "350px"
                    }, {
                        sTitle: i.i18n.active().userportal.to_dialed_number,
                        sWidth: "350px"
                    }, {
                        sTitle: i.i18n.active().userportal.duration,
                        sWidth: "160px"
                    }, {
                        sTitle: "billing_seconds",
                        bVisible: !1
                    }];
                r.ui.table.create("user_cdr", t("#user_cdr-grid", n), o, {}, {
                    sDom: '<"date">frtlip',
                    sScrollY: "150px",
                    aaSorting: [
                        [0, "desc"]
                    ]
                }), t.fn.dataTableExt.afnFiltering.pop(), t("div.date", n).html(i.i18n.active().userportal.start_date + ': <input id="startDate" readonly="readonly" type="text"/>&nbsp;&nbsp;' + i.i18n.active().userportal.end_date + ': <input id="endDate" readonly="readonly" type="text"/>&nbsp;&nbsp;&nbsp;&nbsp;<button class="button-search monster-button monster-button-primary" id="searchLink" href="javascript:void(0);">' + i.i18n.active().userportal.filter + '</button><label class="call_duration"/>');
                var u = t("#user_cdr-grid_wrapper .call_duration", n);
                t("#user_cdr-grid_wrapper #user_cdr-grid_filter input[type=text]", n).keyup(function() {
                    t(this).val !== "" ? u.hide() : u.show()
                }), t("#searchLink", n).click(function() {
                    var e = t("#startDate", n).val(),
                        o = t("#endDate", n).val(),
                        u = /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/;
                    r.ui.table.user_cdr.fnClearTable(), t("#user_cdr-grid_wrapper .call_duration", n).text("");
                    if (e.match(u) && o.match(u)) {
                        var a = (new Date(e)).getTime() / 1e3 + 62167219200,
                            f = (new Date(o)).getTime() / 1e3 + 62167219200;
                        f - a <= s * 24 * 60 * 60 ? i.listByDate(a, f) : r.ui.alert(r.template(i, "!" + i.i18n.active().userportal.rangeTooLong, {
                            variable: s
                        }))
                    } else r.ui.alert(i.i18n.active().userportal.dates_in_the_filter)
                }), i.initDatePicker(n);
                var a = new Date(i.toStringDate(new Date));
                a.setDate(a.getDate() + 1);
                var f = Math.floor(a.getTime() / 1e3) + 62167219200,
                    l = f - s * 24 * 60 * 60;
                i.listByDate(l, f)
            },
            setupContactListTable: function(e, n) {
                var i = this,
                    e = t(".bottom_part", e),
                    n = n || {},
                    s = [{
                        sTitle: i.i18n.active().userportal.name,
                        sWidth: "300px"
                    }, {
                        sTitle: i.i18n.active().userportal.internal_number,
                        fnRender: function(e) {
                            var t = "-",
                                n = e.aData[e.iDataColumn];
                            return n !== "-" && (t = '<a class="link-quickcall" data-number="' + n + '">' + n + "</a>"), t
                        },
                        sWidth: "200px"
                    }, {
                        sTitle: i.i18n.active().userportal.external_number,
                        fnRender: function(e) {
                            var t = "-",
                                n = e.aData[e.iDataColumn];
                            return n !== "-" && (t = '<a class="link-quickcall" data-number="' + n + '">' + n + "</a>"), t
                        },
                        sWidth: "200px"
                    }];
                r.ui.table.create("contact_list", t("#contact_list_grid", e), s, {}, {
                    sDom: '<"contact_title">frtlip',
                    bAutoWidth: !1,
                    aaSorting: [
                        [0, "desc"]
                    ]
                }), t(e).delegate(".link-quickcall", "click", function() {
                    var n = t("#device_quickcall", e).val(),
                        s = t(this).data("number");
                    n && n.length === 32 ? i.callApi({
                        resource: "device.quickcall",
                        data: {
                            accountId: i.accountId,
                            deviceId: n,
                            number: s
                        },
                        success: function(e) {}
                    }) : r.ui.alert(i.i18n.active().userportal.you_need_to_select_a_registered_device)
                }), t("div.contact_title", e).html('<div class="device-selector">' + i.i18n.active().userportal.quickcall_device + '<select class="medium" id="device_quickcall"></select><input type="text" id="manual_number" placeholder="2000"></input><button id="quickcall_btn" style="display: none;" class="btn primary">' + i.i18n.active().userportal.call + "</button></div>"), t("#manual_number", e).keyup(function() {
                    t(this).val() !== "" ? t("#quickcall_btn", e).show() : t("#quickcall_btn", e).hide()
                }), t("#quickcall_btn", e).click(function() {
                    var n = t("#device_quickcall", e).val(),
                        s = t("#manual_number", e).val();
                    n && n.length === 32 ? i.callApi({
                        resource: "device.quickcall",
                        data: {
                            accountId: i.accountId,
                            deviceId: n,
                            number: s
                        },
                        success: function(e) {}
                    }) : r.ui.alert(i.i18n.active().you_need_to_select_a_registered_device)
                }), t(".cancel-search", e).click(function() {
                    t("#contact_list-grid_filter input[type=text]", e).val(""), r.ui.table.contact_list.fnFilter("")
                }), i.callApi({
                    resource: "contactList.get",
                    data: {
                        accountId: i.accountId
                    },
                    success: function(e, n) {
                        if (e.data) {
                            t.fn.dataTableExt.afnFiltering.pop();
                            var i = [];
                            t.each(e.data, function(e, t) {
                                i.push([t.name, t.internal_number ? t.internal_number : "-", t.external_number ? t.external_number : "-"])
                            }), r.ui.table.contact_list.fnAddData(i)
                        }
                    }
                })
            },
            initDatePicker: function(e) {
                function l(e, t) {
                    var r, o;
                    if (t.id == "startDate") {
                        r = i.datepicker("getDate");
                        if (s.datepicker("getDate") == null) o = r, o.setDate(r.getDate() + f), s.val(n.toStringDate(o));
                        else {
                            o = s.datepicker("getDate");
                            if (o > (new Date(r)).setDate(r.getDate() + f) || o <= r) o = r, o.setDate(o.getDate() + f), o > a ? o = a : !0, s.val(n.toStringDate(o))
                        }
                    } else t.id == "endDate" && i.datepicker("getDate") == null && (r = s.datepicker("getDate"), r.setDate(r.getDate() - 1), i.val(n.toStringDate(r)))
                }

                function c(e) {
                    var t = new Date(2011, 0, 0),
                        r, s = n.userCdrRange;
                    return e.id == "endDate" ? (r = a, i.datepicker("getDate") != null && (t = i.datepicker("getDate"), t.setDate(t.getDate() + 1), r = i.datepicker("getDate"), r.setDate(r.getDate() + s), r > a && (r = a))) : e.id == "startDate" && (r = new Date), {
                        minDate: t,
                        maxDate: r
                    }
                }
                var n = this,
                    r = e,
                    i = t("#startDate", r),
                    s = t("#endDate", r),
                    o = new Date,
                    u, a = new Date,
                    f = n.userCdrRange;
                a.setDate(a.getDate() + 1), t("#startDate, #endDate", r).datepicker({
                    beforeShow: c,
                    onSelect: l
                }), u = a, o.setDate((new Date).getDate() - f + 1), i.datepicker("setDate", o), s.datepicker("setDate", u)
            },
            toStringDate: function(e) {
                var t = e.getDate(),
                    n = e.getMonth() + 1,
                    r = e.getFullYear();
                return t < 10 ? t = "0" + t : !0, n < 10 ? n = "0" + n : !0, n + "/" + t + "/" + r
            },
            listByDate: function(e, n) {
                var i = this,
                    s = function(e, t) {
                        var e = parseFloat(e);
                        return seconds = e % 60, minutes = (e - seconds) / 60 % 60, hours = Math.floor((e - seconds) / 3600), t = t || "numbers", hours < 10 && t == "numbers" && (hours = "0" + hours), minutes < 10 && (minutes = "0" + minutes), seconds < 10 && (seconds = "0" + seconds), t == "verbose" ? e = hours + " hours " + minutes + " minutes and " + seconds + " seconds" : e = hours != "00" ? hours + ":" + minutes + ":" + seconds : minutes + ":" + seconds, e
                    };
                i.callApi({
                    resource: "cdrs.listByUser",
                    data: {
                        accountId: i.accountId,
                        userId: i.userId,
                        filters: {
                            created_from: e,
                            created_to: n,
                            paginate: !1
                        }
                    },
                    success: function(e, n) {
                        var i, o, u = 0,
                            a = [];
                        t.each(e.data, function() {
                            this.duration_seconds > 0 && (i = this.duration_seconds >= 0 ? s(this.duration_seconds) : "--", o = r.util.toFriendlyDate(this.timestamp), u += this.duration_seconds >= 0 ? parseFloat(this.duration_seconds) : 0, a.push([o, this.caller_id_number === this.caller_id_name ? this.caller_id_number || "(empty)" : this.caller_id_number + " (" + this.caller_id_name + ")", this.callee_id_number === this.callee_id_name ? this.callee_id_number || this.to.substring(0, this.to.indexOf("@") != -1 ? this.to.indexOf("@") : this.to.length) || "(empty)" : this.callee_id_number + " (" + this.callee_id_name + ")", i || "-", this.duration_seconds, this.timestamp]))
                        }), u = "Total duration : " + s(u, "verbose"), r.ui.table.user_cdr.fnAddData(a), t(".dataTables_scrollHeadInner, .dataTables_scrollHeadInner table").attr("style", "width:100%")
                    }
                })
            },
            formatVMURI: function(e) {
                var t = this;
                return t.apiUrl + "accounts/" + t.accountId + "/vmboxes/" + e + "/raw?auth_token=" + t.authToken + "&folder=saved"
            },
            getUser: function(e, t) {
                var n = this;
                n.callApi({
                    resource: "user.get",
                    data: {
                        accountId: n.accountId,
                        userId: e
                    },
                    success: function(e) {
                        t && t(e)
                    }
                })
            },
            getRegisteredDevices: function(e) {
                var t = this;
                t.callApi({
                    resource: "device.getStatus",
                    data: {
                        accountId: t.accountId
                    },
                    success: function(t) {
                        e && e(t)
                    }
                })
            },
            getUserDevices: function(e) {
                var t = this;
                t.callApi({
                    resource: "device.list",
                    data: {
                        accountId: t.accountId,
                        filters: {
                            filter_owner_id: t.userId
                        }
                    },
                    success: function(t) {
                        e && e(t)
                    }
                })
            },
            updateUser: function(e, t) {
                var n = this;
                n.callApi({
                    resource: "user.update",
                    data: {
                        accountId: n.accountId,
                        userId: n.userId,
                        data: e
                    },
                    success: function(e) {
                        t && t(e)
                    }
                })
            },
            getVmboxByOwner: function(e, t) {
                var n = this;
                n.callApi({
                    resource: "voicemail.list",
                    data: {
                        accountId: n.accountId,
                        filters: {
                            filter_owner_id: e
                        }
                    },
                    success: function(e) {
                        t && t(e)
                    }
                })
            },
            getVmbox: function(e, t) {
                var n = this;
                n.callApi({
                    resource: "voicemail.get",
                    data: {
                        accountId: n.accountId,
                        voicemailId: e
                    },
                    success: function(e) {
                        t && t(e)
                    }
                })
            },
            updateVmbox: function(e, t) {
                var n = this;
                n.callApi({
                    resource: "voicemail.update",
                    data: {
                        accountId: n.accountId,
                        voicemailId: e.data.id,
                        data: e.data
                    },
                    success: function(e) {
                        t && t(e)
                    }
                })
            }
        };
    return i
});
