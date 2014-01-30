require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function(
    $,
    _,
    mvc
) {
    $("div.fieldset").hide();

    var service = mvc.createService();

    var timechartView = mvc.Components.get('timechart_spent');
    var eventView = mvc.Components.get('event');
    var byUserView = mvc.Components.get('by_user');
    var byIpView = mvc.Components.get('by_ip');

    var unsubmittedTokens = mvc.Components.get('default');
    var submittedTokens = mvc.Components.get('submitted');
    var urlTokens = mvc.Components.get('url');

    if(!unsubmittedTokens.has('event_earliest') || !unsubmittedTokens.has('event_latest')) {
        eventView.$el.parents('.dashboard-panel').hide();
    }

    if(!unsubmittedTokens.has('user')) {
        byIpView.$el.parents('.dashboard-panel').hide();
    }

    function submit_and_update_url() {
        submittedTokens.set(unsubmittedTokens.toJSON());
        mvc.Components.get('url').saveOnlyWithPrefix('form\\.', unsubmittedTokens.toJSON(), {
            replaceState: false
        });
    }

    timechartView.on('click', function(e) {
        e.preventDefault();

        var earliest = e.data.earliest;
        var latest = e.data.latest;

        unsubmittedTokens.set('form.event_earliest', earliest);
        unsubmittedTokens.set('form.event_latest', latest);

        var convert_search = "| stats count | eval time_earliest=" + earliest + " | eval time_latest=" + latest + " | foreach time_* [convert ctime(<<FIELD>>)]";

        service.oneshotSearch(convert_search, {id: "time_convert"}, function(err, results) {
            var earliest_formatted = results.rows[0][1];
            var latest_formatted = results.rows[0][2];

            unsubmittedTokens.set('form.event_earliest_formatted', earliest_formatted);
            unsubmittedTokens.set('form.event_latest_formatted', latest_formatted);

            eventView.$el.parents('.dashboard-panel').show();

            submit_and_update_url();
        });
    });

    byUserView.on('click', function(e) {
        e.preventDefault();

        var user = e.data['click.value'];

        unsubmittedTokens.set('form.user', user);

        byIpView.$el.parents('.dashboard-panel').show();

        submit_and_update_url();
    });

    byIpView.on('click', function(e) {
        e.preventDefault();

        var ip = e.data['click.value'];

        location.href = location.pathname.replace(/\w+$/, "ip_detail") + "?form.ip=" + ip;
    });
});
