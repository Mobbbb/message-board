class JobQueue {
    constructor() {
        this.queue = []
        this.stopStatus = false
    }

    addJob(jobItem) {
        this.queue.push(jobItem)
    }

    stopJob() {
        this.stopStatus = true
    }

    clearJob() {
        this.queue = []
    }

    async startJob() {
        return new Promise(resolve => {
            let jobItem
            const self = this
            const temp = function() {
                jobItem = self.queue.shift()
                jobItem()
                if (self.stopStatus) self.clearJob()
                if (self.queue.length > 0) {
                    requestAnimationFrame(temp)
                } else {
                    self.stopStatus = false
                    resolve()
                }
            }
            requestAnimationFrame(temp)
        })
    }
}
export default JobQueue
