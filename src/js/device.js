import { Device } from '@capacitor/device'

const DEVICE = async () => {
    const device = await Device.getInfo()

    return device
}

export default DEVICE;