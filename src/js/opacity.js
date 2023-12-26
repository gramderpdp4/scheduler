import $ from 'dom7'
import { f7 } from 'framework7-vue';

export const opacity = (condition) => {
    console.log($(".progressbar"))
    if (condition) {
        $(".page-content").css({ opacity: 0.5 });
        f7.progressbar.show()
    } else {
        $(".page-content").css({ opacity: 1 });
        f7.progressbar.hide()
    }
};