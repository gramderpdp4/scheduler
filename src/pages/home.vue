<template>
  <f7-page name="home" @page:init="onPageInit">
    <f7-page-content>
      <div class="grid grid-cols-1 medium-grid-cols-1">
          <div id="demo-calendar-inline-container" class="calendar-element"></div>
          <PanelEvents class="panel-events" :progressbarinfinite="progressbarInfinite" :date="sheet.date" :american_date="sheet.date_american_format"/>
        </div>
    </f7-page-content>
  </f7-page>
</template>
<script>
  import $ from 'dom7'
  import { f7 } from 'framework7-vue';
  import SheetDetails from '../components/sheet.vue'
  import PanelEvents from '../components/panel-events.vue';
  import app from '../js/firebase'
  import { userId, generateUserId } from '../js/user';
  import { opacity } from '../js/opacity'
  import { deviceType } from '../js/orientation-change';

  export default {
    data() {
      return {
        userId: null,
        progressbarInfinite: true,
        panelEventsShow: false,
        panelEvents: {
          show: null,
        },
        sheet: {
          date: null,
          date_american_format: null,
          monthNames: [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
          ]
        }
      }
    },

    components: {
      SheetDetails,
      PanelEvents
    },  
    methods: {
      onPageInit() {
        const self = this;
        const el_panel_events = $(".calendar-element");

        if (deviceType() === "large") {
          el_panel_events.addClass("large").removeClass("small")
          self.panelEvents.show = true
        } else {
          el_panel_events.addClass("small").removeClass("large")
          self.panelEvents.show = false
        }

        window.addEventListener('resize', () => {
           setTimeout(() => {
            const device = deviceType();

            if ( device == "large" ) {
              self.panelEvents.show = true
              el_panel_events.addClass("large").removeClass("small")
              f7.panel.open(".panel-events")
            }  else {
              self.panelEvents.show = false;
              el_panel_events.addClass("small").removeClass("large")
              f7.panel.close(".panel-events")
            }
           }, 0);
        })
        
        const id = userId() ? userId() : generateUserId()

        this.userId = id;

        self.calendarInline = f7.calendar.create({
          containerEl: '#demo-calendar-inline-container',
          value: [new Date()],
          dateFormat: 'dd.mm.yyyy',
          locale: 'pt-BR',
          renderToolbar() {
            return `
                <div class="toolbar calendar-custom-toolbar">
                  <div class="toolbar-inner">
                    <div class="left">
                      <a  class="link icon-only"><i class="icon icon-back"></i></a>
                    </div>
                    <div class="center"></div>
                    <div class="right">
                      <a  class="link icon-only"><i class="icon icon-forward"></i></a>
                    </div>
                  </div>
                </div>
              `.trim();
          },
          on: {
            init(output) {
              opacity(true)
              self.progressbarInfinite = true

              self.changeDateCalendar(output.currentMonth, output.currentYear)

              $('.calendar-custom-toolbar .left .link').on('click', () => {
                self.calendarInline.prevMonth();
              });
              $('.calendar-custom-toolbar .right .link').on('click', () => {
                self.calendarInline.nextMonth();
              });
            },
            dayClick(calendar, dayEl, year, month, day) {
              opacity(true)
              self.progressbarInfinite = true
              self.changeDateCalendar(month, year)
            },
            monthYearChangeStart(c) {
              $('.calendar-custom-toolbar .center').text(
                `${self.$data.sheet.monthNames[c.currentMonth]}, ${c.currentYear}`,
              );
            },
          },
        });
      },

      orientationObserver() {
        const callback = (mutationsList, observer) => {
            for ( const mutation of mutationsList ) {
                if( mutation.type === "attributes" && mutation.attributeName === "data-resize" ) {
                  console.log( orientation())
                }
            }
        };

        const observer = new MutationObserver(callback);

        const target = document.body;

        const config = { attributes: true, attributesFilter: ['data-resize'] };

        observer.observe(target, config)
      },

      changeDateCalendar(month, year) {
        setTimeout(() => {
          const day = $(".calendar-day-selected").text();
          const month_name = this.$data.sheet.monthNames[month];

          $('.calendar-custom-toolbar .center').text(
            `${month_name}, ${year}`,
          );

          this.$data.sheet.date = `${day} de ${month_name} de ${year}`

          const formatted_month = month === 9 ? month + 1 : ( month.toString().length == 1 ? `0${month + 1}` : month + 1 )
          const formmated_day = day.length == 1 ? `0${day}` : day

          this.$data.sheet.date_american_format = `${year}-${formatted_month}-${formmated_day}`
        }, 0);
      },

      popoverInfo(e) {
        const self = this;

        f7.popover.create({
          targetEl: e.target,
          content: `
          <div class="popover">
            <div class="popover-inner">
              <div class="block">
                <div class="block-title">Seu ID de usuário: ${self.$data.userId}</div>
              </div>
            </div>
          </div>
          `
        }).open()
      }

    }
  }
</script>
<style>
  .navbar .left h1 {
    font-size: 1.5rem;
    font-weight: normal;
  }

  .calendar-element {
    height: 100vh;
  }

  .calendar-element.large {
    width: calc(100vw - var(--f7-panel-left-width, var(--f7-panel-width)));
  }

  .calendar-element.small {
    width: 100vw;
  }

  .calendar-element .calendar {
    height: 100vh;
  }
 
</style>