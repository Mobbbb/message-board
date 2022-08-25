<template>
    <div class="image-recognize">
        <div class="recognize-input-wrap">
            <div class="image-textarea" contenteditable="true" ref="imageTextarea"
                placeholder="Ctrl + v 粘贴圣遗物截图，按下回车开始图像识别"
                @paste="onpaste" @keydown="emptyDomHandle" @click="clickTextareaHandle">
            </div>
            <ImageViewer v-model="popImageViewerStatus" :img="imageDataUrl"></ImageViewer>
            <div>
                <gc-button icon="calc" :width="110" :loading="recognizeStatus" @on-click="recognize">开始图像识别</gc-button>
                <div class="warning-text">
                    <p>注意事项：</p>
                    <p>
                        <span>·</span>
                        <span>尽量保证截图内容范围与</span>
                        <el-tooltip effect="light" placement="top">
                            <template #content>
                                <img class="demo-image" src="/resource/genshin-equipment/image/recognize-demo.png">
                            </template>
                            <span class="demo-text">示例截图</span>
                        </el-tooltip>
                        <span>一致(能提升识别速度和准确率)</span>
                    </p>
                    <p><span>·</span>由于识别需要下载必要文件(约20MB)，服务器带宽较小(约150kb/s)，首次加载速度较慢，你忍一下</p>
                    <p><span>·</span>由于对截图内容的裁剪要求较高，此功能不适用于移动端</p>
                    <p><span>·</span>由于角色界面的背景较复杂，暂不支持该界面的圣遗物识别</p>
                </div>
            </div>
        </div>
        <div class="progress-wrap">
            <span>加载核心:</span>
            <el-progress :percentage="percentage.tesseractCore"
                    :status="percentage.tesseractCore === 100 ? 'success' : ''" />
        </div>
        <div class="progress-wrap">
            <span>初始化核心:</span>
            <el-progress :percentage="percentage.initTesseract"
                    :status="percentage.initTesseract === 100 ? 'success' : ''" />
        </div>
        <div class="progress-wrap">
            <span>加载中文训练模型:</span>
            <el-progress :percentage="parseInt(percentage.loadingLanguage)"
                    :status="percentage.loadingLanguage === 100 ? 'success' : ''" /></div>
        <div class="progress-wrap">
            <span>初始化接口:</span>
            <el-progress :percentage="percentage.initApi"
                    :status="percentage.initApi === 100 ? 'success' : ''" /></div>
        <div class="progress-wrap">
            <span>图像识别:</span>
            <el-progress :percentage="percentage.recognizing"
                        :status="percentage.recognizing === 100 ? 'success' : ''" />
        </div>
    </div>
</template>

<script>
import { toRefs, reactive, ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { deepClone } from '@/libs/util'
import { formatRecognizeRes, getRecognizeWhitelist } from '@/libs/data-processing'
import ImageViewer from '@/components/image-viewer.vue'

export default {
    name: 'image-recognize',
    components: {
        ImageViewer,
    },
    setup(props, { emit }) {
        let worker = null
        const percentage = {
            tesseractCore: 0,
            initTesseract: 0,
            loadingLanguage: 0,
            initApi: 0,
            recognizing: 0,
        }
        const imageTextarea = ref(null)
        const popImageViewerStatus = ref(false)
        const recognizeStatus = ref(false)
        const data = reactive({
            loadingInterval: null,
            fileData: null,
            imageDataUrl: '',
            percentage: deepClone(percentage),
        })

        const recognize = async () => {
            if (!data.fileData) {
                ElMessage.error('请粘贴图片')
                return
            }
            if (!recognizeStatus.value) {
                recognizeStatus.value = true
                data.percentage.recognizing = 0
                if (!worker) worker = await getWorker()
                const result = await worker.recognize(data.fileData)
                emit('on-recognize', formatRecognizeRes(result.data))
                recognizeStatus.value = false
            }
        }

        const getWorker = async () => {
            let worker = null
            await require.ensure([], async () => {
                const { createWorker } = require('tesseract.js')
                worker = createWorker({
                    logger: m => {
                        if (m.status === 'loading tesseract core') {
                            data.percentage.tesseractCore = m.progress * 100
                        } else if (m.status.indexOf('tesseract') > -1) {
                            data.percentage.initTesseract = m.progress * 100
                        } else if (m.status.indexOf('language') > -1) {
                            if (m.progress === 0) {
                                data.loadingInterval = setInterval(() => {
                                    data.percentage.loadingLanguage += 0.65
                                    if (data.percentage.loadingLanguage >= 99) data.percentage.loadingLanguage = 99
                                }, 1000)
                            }
                            if (m.progress === 1) {
                                clearInterval(data.loadingInterval)
                                data.percentage.loadingLanguage = 100
                            }
                        } else if (m.status.indexOf('api') > -1) {
                            data.percentage.initApi = m.progress * 100
                        } else if (m.status === 'recognizing text') {
                            data.percentage.recognizing = parseInt(m.progress * 100)
                        }
                    },
                    langPath: '/resource/tesseract.js-v2.0.0',
                })
                await worker.load()
                await worker.loadLanguage('chi_sim')
                await worker.initialize('chi_sim')
                await worker.setParameters({
                    tessedit_char_whitelist: getRecognizeWhitelist(),
                })
            })
            return worker
        }

        const onpaste = (e) => {
            imageTextarea.value.innerHTML = ''
            const { items = [] } = e.clipboardData
            ;[...items].forEach(item => {
                if (item.type.indexOf('image') !== -1 && item.kind === 'file') {
                    data.fileData = item.getAsFile()
                    const fileReader = new FileReader()
                    fileReader.onload = (event) => {
                        data.imageDataUrl = event.target.result
                    }
                    fileReader.readAsDataURL(data.fileData)
                }
            })
        }

        const emptyDomHandle = (e) => {
            if (e.key === 'Enter') {
                recognize()
            }
        }

        const clickTextareaHandle = (e) => {
            if (e.target.nodeName === 'IMG') {
                popImageViewerStatus.value = true
            }
        }

        onUnmounted(() => {
            if (worker) worker.terminate()
        })

        return {
            ...toRefs(data),
            imageTextarea,
            popImageViewerStatus,
            recognizeStatus,

            recognize,
            onpaste,
            emptyDomHandle,
            clickTextareaHandle,
        }
    },
}
</script>

<style scoped>
.image-recognize {
    color: #606266;
    padding-bottom: 12px;
}
.recognize-input-wrap {
    display: flex;
}
.demo-image {
    height: 300px;
    display: block;
}
.demo-text {
    cursor: pointer;
    color: #4ea1db;
    margin: 0 1px;
}
.demo-text:hover {
    color: #ca0c16;
}
.progress-wrap {
    display: flex;
    width: 310px;
    padding: 2px 0;
}
.progress-wrap > span {
    display: block;
    flex-shrink: 0;
    width: 110px;
    font-size: 12px;
}
.progress-wrap > div {
    flex: 1;
}
.image-textarea {
    width: 300px;
    height: 220px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 5px 8px;
    overflow: hidden;
    cursor: text;
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    outline: none;
    color: #606266;
    box-sizing: border-box;
    margin: 0 12px 6px 0;
    position: relative;
}
/* 为空时显示 element attribute content */
.image-textarea:empty:before{
    content: attr(placeholder);
    color: #bbb;
    font-size: 13px;
}
.image-textarea:focus {
    border-color: #409eff;
}
.warning-text {
    font-size: 13px;
    color: #bbb;
    padding-top: 6px;
}
.warning-text p {
    margin-top: 2px;
    word-break: break-all;
}
.warning-text > p > span:first-of-type {
    font-weight: bold;
    font-size: 16px;
    margin-right: 4px;
}
</style>

<style>
.image-textarea > img {
    width: 100px;
    max-height: 100%;
    display: block;
    cursor: pointer;
}
.image-textarea > div {
    position: absolute;
}
.progress-wrap .el-progress__text {
    font-size: 12px!important;
}
</style>
