const deviceType = (type) => {
    const device = window.innerWidth <= 600 ? 'small' : 'large';

    const body = document.body
    
    body.setAttribute("data-resize", device);

    return device;
}

export { deviceType }