const tooltipDoubleClickEditChip = (setLocalStorage) => {
    if ( setLocalStorage ) {
        localStorage.setItem("tooltip-double-click", true)
    }

    const localstorage_tooltip_exists = localStorage.getItem("tooltip-double-click");

    return localstorage_tooltip_exists
};

export { tooltipDoubleClickEditChip }