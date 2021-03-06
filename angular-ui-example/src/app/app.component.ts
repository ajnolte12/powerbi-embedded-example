import { Component } from '@angular/core';
import * as pbi from 'powerbi-client'; // https://github.com/Microsoft/PowerBI-JavaScript
import axios from 'axios';
import queryString from 'query-string';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private report;
  private report2;
  private searchTerm = '';

  ngOnInit() {
    const config = {
      headers: {'Access-Control-Allow-Origin': '*'}
    };
    const parsedQueryString = queryString.parse(location.search);
    const embedGeneratorUrl = `<Azure Function Url>`;
    // Get the embed token for the power bi report
    axios.get(embedGeneratorUrl, config).then((data) => {
      const models = pbi.models;
      const parsedQueryString = queryString.parse(location.search);

      // Setup the embedded report with the embed token and url from our request
      const embedConfiguration = {
        type: 'report',
        filters: [],
        id: data.data.ReportId,
        embedUrl: data.data.EmbedUrl,
        tokenType: models.TokenType.Embed,
        accessToken: data.data.EmbedToken,
        /* settings: {
          filterPaneEnabled: true,
          navContentPaneEnabled: false
        } */
      };

      // Display 2 reports using the powerbi client
      let powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
      const reportContainer = document.getElementById('reportContainer');
      this.report = powerbi.embed(reportContainer, embedConfiguration);
      const reportContainer2 = document.getElementById('reportContainer2');
      this.report2 = powerbi.embed(reportContainer2, embedConfiguration);

    }).catch((error) => console.log(error));
  }

  onPrint1 = () => {
    this.report.print();
  }

  onPrint2 = () => {
    this.report2.print();
  }

  onSearch = (term) => {
    this.searchTerm = term;
  }

  setFilter = () => {
    const filter = {
      $schema: "http://powerbi.com/product/schema#basic",
      target: {
          table: "sampledata3",
          column: "Industry"
      },
      operator: "Equals",
      values: [this.searchTerm]
    };
    this.report.setFilters([filter]);
    this.report2.setFilters([filter]);
  }
}
