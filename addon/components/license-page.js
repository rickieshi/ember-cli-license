import component from 'ember-component';
import layout from '../templates/components/license-page';
import $ from 'jquery';
import {
    isEmpty
} from 'ember-utils';
import {
    htmlSafe
} from 'ember-string';

export default component.extend({
    layout,
    title: null,
    classNames: ['license-page'],

    init() {
        this._super(...arguments);
        // TODO: parameterize this path
        $.ajax('assets/licenses/licenses.html').then(content => {
            this.set('content', htmlSafe(content));
        }, () => {
            this.set('content', 'Error in fetching licenses');
        });
    },
    didInsertElement() {
        this.$('.modal').click(e => {
            // if click on background, hide modal
            if (e.target === this.$('.modal')[0]) {
                this.send('hideModal');
            }
        })
        $('body').click('a.license-link', e => {
                var target = $(e.target);
                if (!isEmpty(target.attr('linkTo'))) {
                    this.$('.modal').scrollTop(0);
                    this.$('.modal').animate({
                        scrollTop: $(document.getElementById(`${target.attr('linkTo')}`)).offset().top
                    });
                }
            })
            .click('a.license-redirect, a.repo-redirect', e => {
                var target = $(e.target);
                if (!isEmpty(target.attr('href'))) {
                    window.open(target.attr('href'), '_blank');
                }
            });
    },

    actions: {
        openModal() {
            this.$('.modal').fadeIn();
        },
        hideModal() {
            this.$('.modal').fadeOut();
        }
    }
});
