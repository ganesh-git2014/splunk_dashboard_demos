require([
    'jquery',
    'underscore',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/postprocessmanager',
    'splunkjs/mvc/chartview',
    'splunkjs/mvc/tableview',
    'splunkjs/mvc/simplexml/ready!'
], function(
    $,
    _,
    mvc,
    SearchManager,
    PostProcessManager,
    ChartView,
    TableView
) {
    new SearchManager({
        id: "audit_base_search",
        preview: true,
        cache: true,
        earliest_time: "-15m@m",
        latest_time: "now",
        search: 'index=_audit action=search (info=granted OR info=completed) NOT REST: NOT search_id=*subsearch* | eval time=_time | transaction search_id startswith="info=granted" endswith="info=completed"'
    });

    new PostProcessManager({
        id: "search_range_chart",
        managerid: "audit_base_search",
        search: "stats values(time) AS time BY search_id | streamstats count AS id | mvexpand time | eval _time=time | timechart values(id) AS id BY search_id limit=0"
    });

    new PostProcessManager({
        id: "search_range_table",
        managerid: "audit_base_search",
        search: "stats first(time) AS start last(time) AS end values(duration) AS duration by search_id | convert ctime(start) | convert ctime(end)"
    });

    new ChartView ({
        id: "search_range_chart_view",
        managerid: "search_range_chart",
        type: "line",
        "charting.chart.nullValueMode": "connect",
        "charting.legend.placement": "bottom",
        el: $("#search_range_chart")
    }).render();

    new TableView ({
        id: "search_range_table_view",
        managerid: "search_range_table",
        el: $("#search_range_table")
    }).render();

    new SearchManager({
        id: "rest_base_search",
        preview: true,
        cache: true,
        search: '| rest /servicesNS/-/-/saved/searches'
    });

    new PostProcessManager({
        id: "saved_searches",
        managerid: "rest_base_search",
        search: "search is_scheduled=0 | table title disabled eai:acl.app eai:acl.owner dispatch.ttl dispatch.latest_time dispatch.earliest_time search"
    });

    new PostProcessManager({
        id: "scheduled_searches",
        managerid: "rest_base_search",
        search: "search is_scheduled=1 | table title disabled eai:acl.app eai:acl.owner cron_schedule next_scheduled_time dispatch.ttl dispatch.latest_time dispatch.earliest_time search"
    });

    new TableView ({
        id: "saved_searches_view",
        managerid: "saved_searches",
        el: $("#saved_searches_table")
    }).render();

    new TableView ({
        id: "scheduled_searches_view",
        managerid: "scheduled_searches",
        el: $("#scheduled_searches_table")
    }).render();
});
