import { util } from "../common/util.js"
import { commomClass } from "../common/common.js"
import { TR } from "../common/translate.js"

class httpClass {
    constructor() {
        this.sharedStorage = {}
        this.defaultSharedStorage = {}
        this.common = new commomClass()
    }

    _initDefaultSharedStorage() {
        // start of default keys
        this.defaultSharedStorage.jsVersion = 1
        this.defaultSharedStorage.name = ""
        this.defaultSharedStorage.serverAddress = "127.0.0.1"
        this.defaultSharedStorage.serverPort = "1080"
        // end of default keys
        this.defaultSharedStorage.serverUsername = ""
        this.defaultSharedStorage.serverPassword = ""
        this.defaultSharedStorage.serverHeaders = ""
        this.defaultSharedStorage.serverSecurity = "none"
        this.defaultSharedStorage.utlsFingerprint = ""
        this.defaultSharedStorage.serverSNI = ""
        this.defaultSharedStorage.serverALPN = ""
        this.defaultSharedStorage.serverCertificates = ""
        this.defaultSharedStorage.serverPinnedCertificates = ""
        this.defaultSharedStorage.serverAllowInsecure = false

        for (var k in this.defaultSharedStorage) {
            let v = this.defaultSharedStorage[k]
            this.common._setType(k, typeof v)

            if (!this.sharedStorage.hasOwnProperty(k)) {
                this.sharedStorage[k] = v
            }
        }
    }

    _onSharedStorageUpdated() {
        // not null
        for (var k in this.sharedStorage) {
            if (this.sharedStorage[k] == null) {
                this.sharedStorage[k] = ""
            }
        }
        this._setShareLink()
    }

    _setShareLink() { }

    // 解析 headers 文本：每行 "Key: Value" 或 "Key=Value"，空行/无分隔符行忽略
    _parseHeaders(text) {
        let headers = {}
        if (text == null || text == "") return headers
        for (let line of text.split("\n")) {
            let s = line.trim()
            if (s == "") continue
            let idx = s.indexOf(":")
            if (idx < 0) idx = s.indexOf("=")
            if (idx < 0) continue
            let key = s.substring(0, idx).trim()
            let value = s.substring(idx + 1).trim()
            if (key != "") headers[key] = value
        }
        return headers
    }

    // UI Interface

    requirePreferenceScreenConfig() {
        let sb = [
            {
                "title": TR("serverSettings"),
                "preferences": [
                    {
                        "type": "EditTextPreference",
                        "key": "serverAddress",
                        "icon": "ic_hardware_router",
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverPort",
                        "icon": "ic_maps_directions_boat",
                        "EditTextPreferenceModifiers": "Port",
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverUsername",
                        "icon": "ic_baseline_person_24",
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverPassword",
                        "icon": "ic_baseline_person_24",
                        "summaryProvider": "PasswordSummaryProvider",
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverHeaders",
                        "icon": "ic_baseline_format_align_left_24",
                    },
                    {
                        "type": "SimpleMenuPreference",
                        "key": "serverSecurity",
                        "icon": "ic_baseline_layers_24",
                        "entries": {
                            "none": "none",
                            "tls": "tls",
                        }
                    },
                ]
            },
            {
                "key": "serverSecurityCategory",
                "preferences": [
                    {
                        "type": "SimpleMenuPreference",
                        "key": "utlsFingerprint",
                        "entries": {
                            "": "",
                            "chrome": "chrome",
                            "firefox": "firefox",
                            "safari": "safari",
                            "ios": "ios",
                            "android": "android",
                            "edge": "edge",
                            "360": "360",
                            "qq": "qq",
                            "random": "random",
                            "randomized": "randomized",
                        }
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverSNI",
                        "icon": "ic_action_copyright"
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverALPN",
                        "icon": "ic_baseline_legend_toggle_24"
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverCertificates",
                        "icon": "ic_baseline_vpn_key_24"
                    },
                    {
                        "type": "EditTextPreference",
                        "key": "serverPinnedCertificates",
                        "icon": "ic_baseline_push_pin_24"
                    },
                    {
                        "type": "SwitchPreference",
                        "key": "serverAllowInsecure",
                        "icon": "ic_notification_enhanced_encryption",
                        "summary": TR("serverAllowInsecure_summary")
                    },
                ]
            }
        ]
        this.common._applyTranslateToPreferenceScreenConfig(sb, TR)
        return JSON.stringify(sb)
    }

    // 开启设置界面时调用
    setSharedStorage(b64Str) {
        this.sharedStorage = util.decodeB64Str(b64Str)
        this._initDefaultSharedStorage()
    }

    // 开启设置界面时调用
    requireSetProfileCache() {
        for (var k in this.defaultSharedStorage) {
            this.common.setKV(k, this.sharedStorage[k])
        }
    }

    // 设置界面创建后调用
    onPreferenceCreated() {
        let this2 = this

        function listenOnPreferenceChangedNow(key) {
            neko.listenOnPreferenceChanged(key)
            this2._onPreferenceChanged(key, this2.sharedStorage[key])
        }

        listenOnPreferenceChangedNow("serverSecurity")
    }

    // 保存时调用（混合编辑后的值）
    sharedStorageFromProfileCache() {
        for (var k in this.defaultSharedStorage) {
            this.sharedStorage[k] = this.common.getKV(k)
        }
        this._onSharedStorageUpdated()
        return JSON.stringify(this.sharedStorage)
    }

    // 用户修改 preference 时调用
    onPreferenceChanged(b64Str) {
        let args = util.decodeB64Str(b64Str)
        this._onPreferenceChanged(args.key, args.newValue)
    }

    _onPreferenceChanged(key, newValue) {
        if (key == "serverSecurity") {
            if (newValue == "none") {
                neko.setPreferenceVisibility("serverSecurityCategory", false)
            } else {
                neko.setPreferenceVisibility("serverSecurityCategory", true)
            }
        }
    }

    // Interface

    parseShareLink(b64Str) { }

    buildAllConfig(b64Str) {
        try {
            let args = util.decodeB64Str(b64Str)
            let ss = util.decodeB64Str(args.sharedStorage)

            let t0 = {
                "log": {
                    "loglevel": "debug"
                },
                "inbounds": [
                    {
                        "port": args.port,
                        "listen": "127.0.0.1",
                        "protocol": "socks",
                        "settings": {
                            "udp": true
                        }
                    }
                ],
                "outbounds": [
                    {
                        "mux": {
                            "enabled": false
                        },
                        "protocol": "http",
                        "settings": {
                            "servers": [
                                {
                                    "address": args.finalAddress,
                                    "port": args.finalPort
                                }
                            ] 
                        },
                        "streamSettings": {
                            "network": "tcp"
                        }
                    }
                ]
            }

            // 认证：user 是对象数组，serverUsername 为空就整个不写
            if (ss.serverUsername.isNotBlank()) {
                t0.outbounds[0].settings.servers[0].users = [
                    {
                        "user": ss.serverUsername,
                        "pass": ss.serverPassword
                    }
                ]
            }

            // headers：输入框为空时不添加该字段
            let headers = this._parseHeaders(ss.serverHeaders)
            if (Object.keys(headers).length > 0) {
                t0.outbounds[0].settings.headers = headers
            }

            // Transport layer encryption：仅 TLS 时才有这个块
            if (ss.serverSecurity == "tls") {
                let t2 = {
                    "serverName": ss.serverSNI,
                    "allowInsecure": ss.serverAllowInsecure
                }
                if (ss.utlsFingerprint.isNotBlank()) t2["fingerprint"] = ss.utlsFingerprint
                if (ss.serverALPN.isNotBlank()) t2["alpn"] = ss.serverALPN.lines()
                if (ss.serverCertificates.isNotBlank()) t2["certificates"] = { "certificate": ss.serverCertificates.lines() }
                if (ss.serverPinnedCertificates.isNotBlank()) t2["pinnedPeerCertificateChainSha256"] = ss.serverPinnedCertificates.lines()

                t0.outbounds[0].streamSettings["security"] = "tls"
                t0.outbounds[0].streamSettings["tlsSettings"] = t2
            }

            let v = {}
            v.nekoCommands = ["%exe%", "-config", "config.json"]

            v.nekoRunConfigs = [
                {
                    "name": "config.json",
                    "content": JSON.stringify(t0)
                }
            ]

            return JSON.stringify(v)
        } catch (error) {
            neko.logError(error.toString())
        }
    }
}

export const http = new httpClass()
