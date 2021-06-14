
export class DeviceBridge {
    /**
     * Send a command to a device application and get its answer
     * @param {Buffer} apdu A command to send to the device application
     * 
     * @returns {Promise<Buffer>} The response of the APDU from the device application
     */
    async exchange(apdu: Buffer): Promise<Buffer> {
        apdu;
        throw new Error('Function is not implemented yet');
    }
}