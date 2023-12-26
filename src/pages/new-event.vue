<template>
    <f7-popup push swipe-to-close="to-bottom" @popup:open="popupOpen">
        <f7-page>
            <f7-navbar>
                <div class="left margin-left">
                    Novo evento
                </div>
                <div class="right margin-right">
                    <a href="#" class="popup-close">
                        Fechar
                    </a>
                </div>
            </f7-navbar>
            <f7-block-title v-if="eventsSelected.length == 1">Evento selecionado</f7-block-title>
            <f7-block-title v-else-if="eventsSelected.length > 1">Eventos selecionados</f7-block-title>
            <f7-block>
                <f7-chip v-for="(event, index) in eventsSelected" @dblclick="(event) => dblClick(event, index)"
                    @touchstart="(event) => chipLongPress(event, index)" @touchend="chipLongPressCancel" :text="event.type"
                    :id="'chip-' + event.type" :media="event.time || event.type.substring(0, 1)" media-bg-color="red"
                    deleteable @delete="deleteEventChip(this, event.type)">
                </f7-chip>
                <f7-block-title style="margin-left: 0px">Selecione um evento</f7-block-title>
                <f7-list strong-ios outline-ios dividers-ios>
                    <f7-list-item v-for="(event, indice) in events" :title="event.type" :id="'checkbox-' + event.type"
                        checkbox checkbox-icon="start" @change="eventChange(indice)" name="radio-start">
                    </f7-list-item>
                </f7-list>
                <f7-button fill :disabled="buttonDisabled" @click="saveEvents">
                    <span v-if="eventsSelected.length > 1">Salvar eventos</span>
                    <span v-else>Salvar evento</span>
                </f7-button>
            </f7-block>
        </f7-page>
    </f7-popup>
</template>
<script>
import { DatetimePicker } from '@capawesome-team/capacitor-datetime-picker';
import { f7 } from 'framework7-vue';
import { $ } from 'dom7';
import DEVICE from '../js/device'
import app from '../js/firebase';
import { getDatabase, ref, push, orderByChild, equalTo, query, onValue, update } from 'firebase/database';
import { userId } from '../js/user';
import { DateTime } from 'luxon'
import img_events_save from '../assets/events-save.svg';
import { tooltipDoubleClickEditChip } from '../js/localstorage';

const dt = DateTime.now().setLocale('pt')

const db = getDatabase(app)

export default {
    data() {
        return {
            events: [
                { type: 'Trabalhar' },
                { type: 'Academia' },
                { type: 'Estudar' },
                { type: 'Assistir' },
                { type: 'Viajar' },
                { type: 'Jogar' },
                { type: 'Ler' },
            ],
            eventsSelected: [],
            buttonDisabled: true,
            daySelected: null,
            longPress: null
        }
    },

    props: {
        updateDatabase: Function
    },  

    methods: {
        eventChange(index) {
            const selected = this.events[index];
            const find = this.$data.eventsSelected.findIndex(find => find.type === selected.type)

            if (find == -1) {
                const index = this.$data.eventsSelected.push(selected)
                this.capacitorPickerTimeAndDate(selected.type, index - 1)
            } else {
                this.removeEventfromObject(selected.type)
            }

            this.disabledButton()
        },

        disabledButton() {
            if (this.eventsSelected.length > 0) this.buttonDisabled = false
            else this.buttonDisabled = true
        },

        removeEventfromObject(type) {

            const find = this.$data.eventsSelected.findIndex(find => find.type === type)

            this.$data.eventsSelected.splice(find, 1)

            $(`#checkbox-${type} input`).prop('checked', false)

            this.disabledButton()
        },

        deleteEventChip(e, type) {
            const target = e.target;
            const methods = this;

            const dialog = f7.dialog.create({
                text: 'Deseja remover esse evento?',
                buttons: [
                    {
                        text: 'Cancelar',
                        onClick: function () {
                            dialog.close()
                        }
                    },
                    {
                        text: 'OK',
                        onClick: function () {
                            dialog.close()
                            $(target).parents(".chip").remove()
                            methods.removeEventfromObject(type)
                            $(`#checkbox-${type} input`).prop('checked', false)
                        }
                    },
                ]
            }).open()
        },

        capacitorPickerTimeAndDate(type, index) {
            const methods = this;

            f7.dialog.create({
                title: type,
                text: 'Defina um horário para esse evento',
                buttons: [
                    {
                        text: 'Cancelar',
                        onClick: function () {
                            methods.removeEventfromObject(type)
                        }
                    },
                    {
                        text: 'OK',
                        onClick: function () {
                            methods.pickerTime(type, index)
                        }
                    }
                ],
            }).open()

        },

        pickerTime(type, index, time_exists) {

            const methods = this;

            const today = new Date();

            let time = time_exists ? [time_exists.split(':')[0], time_exists.split(':')[1]] : [today.getHours(), today.getMinutes() < 10 ? '0' + today.getMinutes() : today.getMinutes()];

            f7.picker.create({
                backdrop: true,
                toolbar: true,
                sheetPush: false,
                push: false,
                closeByOutsideClick: false,
                openIn: 'popup',
                renderToolbar() {
                    return `
                    <div class="toolbar">
                        <div class="toolbar-inner">
                            <a href="#" class="link">Defina um horário</a>
                            <a href="#" class="link sheet-close">Fechar</a>
                        </div>
                    </div>
                    `
                },
                rotateEffect: true,
                value: time,
                formatValue: function (values, displayValues) {
                    return displayValues[0] + ' ' + values[1] + ', ' + values[2] + ' ' + values[3] + ':' + values[4];
                },
                cols: [
                    {
                        values: (function () {
                            let arr = [];
                            for (let i = 0; i <= 23; i++) { arr.push(i); }
                            return arr;
                        })(),
                    },
                    {
                        divider: true,
                        content: ':'
                    },
                    {
                        values: (function () {
                            let arr = [];
                            for (let i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                            return arr;
                        })(),
                    }
                ],
                on: {
                    change: function (picker, values, displayValues) {
                        methods.$data.eventsSelected[index].time = `${values[0]}:${values[1]}`
                        let daysInMonth = new Date(picker.value[2], picker.value[0] * 1 + 1, 0).getDate();
                        if (values[1] > daysInMonth) {
                            picker.cols[1].setValue(daysInMonth);
                        }
                    },
                    closed: function () {
                        if (methods.eventsSelected.length > 0 && !tooltipDoubleClickEditChip()) {
                            setTimeout(() => {
                                const chip = $(".chip");

                                if (chip.length > 0) {
                                    f7.popover.create({
                                        targetY: -40,
                                        content: `
                                            <div class="popover">
                                                <p class="text-align-center padding">
                                                    Você pode editar o horário clicando 2x ou pressionando ( Mobile )
                                                </p>
                                            </div>
                                        `,
                                        arrow: true,
                                        targetEl: chip[0],
                                        on: {
                                            close: function(){
                                                tooltipDoubleClickEditChip(true)
                                            }
                                        }
                                    }).open()
                                }

                            }, 0)
                        }
                    }
                }
            }).open()
        },

        chipLongPress(event, index) {
            const click_on_chip_media = $(event.target);
            const time = click_on_chip_media.hasClass("chip-media") ? click_on_chip_media.text() : $(event.target).siblings('.chip-media').text();

            this.longPress = setTimeout(() => {
                this.pickerTime(event, index, time)
            }, 500)
        },

        dblClick(event, index) {
            const click_on_chip_media = $(event.target);
            const time = click_on_chip_media.hasClass("chip-media") ? click_on_chip_media.text() : $(event.target).siblings('.chip-media').text();
            this.pickerTime(event, index, time)
        },

        chipLongPressCancel() {
            clearTimeout(this.longPress)
        },

        convertVueObjectToObject(object) {
            if (typeof object === "object") {
                const convertJsonStringify = JSON.stringify(object)

                return JSON.parse(convertJsonStringify)
            } else {
                return 'O valor passado não é um objeto'
            }
        },

        async saveEvents(day) {
            const date = this.luxonFormattedDate(this.$data.daySelected, 'yyyy-MM-dd');

            console.log(`events/${userId()}/${date}`)

            const path_save_events = ref(db, `events/${userId()}/${date}`)

            const arr = this.convertVueObjectToObject(this.eventsSelected);

            for (const i in arr) {
                const event = arr[i];

                const query_event_exists = query(path_save_events, orderByChild('type'), equalTo(event.type))

                onValue(query_event_exists, async (output) => {
                    if (output.exists()) {
                        const data = output.val();
                        const keys = Object.keys(data);

                        for (const key of keys) {
                            //Pega o caminho do evento que já existe no banco
                            const ref_update_an_existing_event = ref(db, `events/${userId()}/${date}/${key}`)

                            //Caso o evento já esteja salvo no dia selecionado. Atualize ele.
                            await update(ref_update_an_existing_event, event)
                        }


                    } else {
                        //Caso o evento não esteja salvo no dia selecionado. Salve ele.
                        await push(path_save_events, event)
                            .then(success => {
                                console.log(`save ${i}`)
                            })
                            .catch(error => {
                                console.log(`error save ${i}`)
                            })
                    }
                }, { onlyOnce: true })
            }

            f7.popup.close('.popup')

            const dialog = f7.dialog.create({
                title: `<img src="${img_events_save}" width="120px" height="120px" style="margin: 0 auto; display: flex;" />`,
                text: '<p class="text-align-center">Os eventos foram salvos</p>',
                buttons: [
                    {
                        text: 'OK',
                        onClick: function () {
                            dialog.close()
                        }
                    }
                ]
            }).open()
        },

        popupOpen(e) {
            this.$data.daySelected = e.route.params.date;
            console.log(this.$props.f7route)
            console.log(this.$props.f7router)
        },

        dbClick() {
            alert(true)
        },

        luxonFormattedDate(date, format) {
            const getCurrentDate = DateTime.fromFormat(date, 'd \'de\' LLLL \'de\' yyyy', { locale: 'pt-BR' });

            return getCurrentDate.toFormat('yyyy-MM-dd')
        }
    },
}
</script>
<style>
.chip .chip-media {
    width: fit-content !important;
    font-size: 0.8rem;
    padding: 0.4rem !important;
}

.chip {
    margin: 0px 0.5rem;
}
</style>