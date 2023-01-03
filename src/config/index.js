const deviceMatch = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i) || [] // eslint-disable-line

export const DEV = 'dev'
export const PC = 'PC'

export const festivalList = [
    '2022-09-10', '2022-09-11', '2022-09-12',
    '2022-10-01', '2022-10-02', '2022-10-03', '2022-10-04', '2022-10-05', '2022-10-06', '2022-10-07',
    '2023-01-02',
    '2023-01-21', '2023-01-22', '2023-01-23', '2023-01-24', '2023-01-25', '2023-01-26', '2023-01-27', 
]

let env = ''

if (process.env.NODE_ENV === 'production') env = ''
export default {
    device: deviceMatch[0] || PC,
    env,
}
