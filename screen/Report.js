import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {Table, Row} from 'react-native-table-component';
import {encode} from 'base-64';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export default class Report extends Component {
  constructor(props) {
    super(props);
    const {route} = this.props;
    this.state = {
      tableHead: [
        'SL NO',
        'TruckNo',
        'ChallanNo',
        'Loading MT./Pkts',
        'Unloading MT./Pkts',
        'Unloading Date',
        'Cash',
        'Bank',
        'Hsd',
        'Pump Name',
        'Remarks',
      ],
      widthArr: [
        40, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150,
      ],
      tableData: [],
      currentPage: 1,
      perPage: 100,
      branchName: '',
      clientName: '',
      jobName: '',
      selectedDate: new Date(),
      dataAvailable: true,
      columnDataMapping: {
        'Loading Qty': 'NetWT',
      },
      username: route.params?.username || '',
      password: route.params?.password || '',
      showDatePicker: false,
    };
    this.serialNumber = 0;
    this.handlePrintPDF = this.handlePrintPDF.bind(this);
    this.calculateSum = this.calculateSum.bind(this);
  }
  componentDidMount() {
    this.loadData();
    this.fetchJobData();
  }

  fetchJobData = () => {
    const {jobName, base64Credentials} = this.state;
    const apiUrl = `https://mis.santukatransport.in/API/Test/GetJobDetails?JobNo=${jobName}`;

    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${base64Credentials}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        this.setState({jobData: data.data});
        console.log(data, 'response data'); // Log the fetched data instead of response
      })
      .catch(error => {
        console.error('Error fetching job data:', error);
      });
  };

  loadData = () => {
    this.serialNumber = 0;
    const {
      currentPage,
      perPage,
      branchName,
      clientName,
      jobName,
      selectedDate,
      base64Credentials,
      jobData,
    } = this.state;

    console.log(jobName, 'djkdkj');

    const headers = new Headers({
      Authorization: `Basic ${base64Credentials}`, // Use base64Credentials from state
      'Content-Type': 'application/json',
    });

    const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1,
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    let apiUrl = `http://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${branchName}`;

    if (clientName) {
      apiUrl += `&GetClientDetails?ClientName=${clientName}`;
    }

    if (jobName && jobData.length > 0) {
      apiUrl += `&JobId=${jobData[0].JobId}&JobNo=${jobData[0].JobNo}`;
    }

    if (selectedDate) {
      apiUrl += `&selectedDate=${formattedSelectedDate}`;
    }

    fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    })
      .then(response => response.json())
      .then(data => {
        const filteredData = data.data.filter(row => {
          const originalLoadDate = new Date(row['LoadDate']);
          const selectedDateFormatted = new Date(selectedDate);
          const jobNameMatch = row['JobNo'] === jobData[0].JobNo;
          return (
            originalLoadDate.toDateString() ===
              selectedDateFormatted.toDateString() && jobNameMatch
          );
        });
        // Update the table data with the filtered data
        this.setState({
          tableData: filteredData,
          dataAvailable: filteredData.length > 0,
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({dataAvailable: false});
      });
  };

  loadNextPage = () => {
    this.setState(
      prevState => ({currentPage: prevState.currentPage + 1}),
      this.loadData,
    );
  };

  loadPreviousPage = () => {
    this.setState(
      prevState => ({currentPage: prevState.currentPage - 1}),
      this.loadData,
    );
  };

  handleDateFilter = () => {
    const formattedSelectedDate = moment(this.state.selectedDate).format(
      'DD-MM-YYYY',
    );
    console.log('Selected Date:', formattedSelectedDate);

    this.loadData();
  };

  // Function to calculate the sum of the 'Cash' column
  calculateCashSum = () => {
    const {tableData} = this.state;
    let cashSum = 0;
    for (const rowData of tableData) {
      if (rowData.Cash !== null) {
        cashSum += parseFloat(rowData.Cash);
      }
    }
    return cashSum;
  };

  calculateHsdSum = () => {
    const {tableData} = this.state;
    let hsdSum = 0;
    for (const rowData of tableData) {
      if (rowData.Hsd !== null) {
        hsdSum += parseFloat(rowData.Hsd);
      }
    }
    return hsdSum;
  };

  // Function to calculate the sum of the 'E-Adv' column
  calculateEAdvSum = () => {
    const {tableData} = this.state;
    let eAdvSum = 0;
    for (const rowData of tableData) {
      if (rowData['E-Adv'] !== null) {
        eAdvSum += parseFloat(rowData['E-Adv']);
      }
    }
    return eAdvSum;
  };

  calculateSum = columnName => {
    const {tableData} = this.state;
    let sum = 0;
    for (const rowData of tableData) {
      const columnValue = rowData[columnName];
      if (!isNaN(columnValue) && parseFloat(columnValue) !== 0) {
        sum += parseFloat(columnValue);
      }
    }
    return !isNaN(sum) && sum !== 0 ? sum : '';
  };

  handlePrintPDF = async () => {
    console.log('Printing PDF...');
    console.log('tableHead:', this.state.tableHead);
    console.log('tableData:', this.state.tableData);
    // Check if both table header and data are available
    if (
      this.state.tableHead.length === 0 ||
      this.state.tableData.length === 0
    ) {
      console.warn('Table header or data is empty. PDF will not be generated.');
      return;
    }
    const selectedDate = moment(this.state.selectedDate).format('DD/MM/YYYY');

    const htmlContent = `
<html>
  <head>
    <style>
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid black;
        padding: 4px;
        text-align: center;
      }
      h1, h2 {
        text-align: center;
      }
      h3 {
        text-align: left;
        margin-left: 10px;
        margin-bottom: 10px;
      }
      h4 {
        text-align: right;
        margin-left: 10px;
      }
    </style>
  </head>
  <body>
    <h1>SANTUKA TRANSPORT</h1>
    <h2>NIE, JAGATPUR, CUTTACK</h2>
    
    <h4>Date: ${selectedDate}</h4>

    <table>
      <thead>
        <tr>
          ${this.state.tableHead.map(header => `<th>${header}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${this.state.tableData
          .map(
            (row, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${row['TruckNo'] !== undefined ? row['TruckNo'] : ''}</td>
            <td>${row['Challan'] !== undefined ? row['Challan'] : ''}</td>
           
            <td>${
              row['TareWT'] !== undefined ? row['TareWT'].toFixed(3) : ''
            }</td>
            <td>${
              row['Unloading Qty'] !== undefined ? row['Unloading Qty'] : ''
            }</td>
            <td>${
              row['Unloading Date'] !== undefined
                ? moment(row['Unloading Date']).format('DD-MM-YYYY')
                : ''
            }</td>
            <td>${
              row['Cash'] !== undefined && parseFloat(row['Cash']) !== 0
                ? row['Cash'].toFixed(2)
                : ''
            }</td>
            <td>${
              row['E-Adv'] !== undefined && parseFloat(row['E-Adv']) !== 0
                ? row['E-Adv'].toFixed(2)
                : ''
            }</td>
            <td>${
              row['Hsd'] !== undefined && parseFloat(row['Hsd']) !== 0
                ? row['Hsd'].toFixed(2)
                : ''
            }</td>
            <td>${row['Pump Name'] !== undefined ? row['Pump Name'] : ''}</td>
            <td>${row['Remarks'] !== undefined ? row['Remarks'] : ''}</td>
          </tr>
        `,
          )
          .join('')}
        <tr>
          <td colspan="${this.state.tableHead.length}">Total</td>
          <td>${this.calculateSum('Loading Qty')}</td>
          <td>${this.calculateSum('Unloading Qty')}</td>
          <td>${this.calculateCashSum()}</td>
          <td>${this.calculateEAdvSum()}</td>
          <td>${this.calculateHsdSum()}</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
    `;

    const options = {
      html: htmlContent,
      fileName: 'Report',
      directory: 'Documents',
    };
    try {
      const pdf = await RNHTMLtoPDF.convert(options);
      console.log('PDF file creatwslnjndjkded at:', pdf.filePath);

      Alert.alert(
        'PDF Generated',
        'PDF has been generated successfully!',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || this.state.selectedDate;
    this.setState({selectedDate: currentDate, showDatePicker: false}, () => {
      this.handleDateFilter();
    });
  };
  showDatePicker = () => {
    this.setState({showDatePicker: true});
  };

  render() {
    const {
      tableHead,
      tableData,
      currentPage,
      dataAvailable,
      showDatePicker,
      selectedDate,
    } = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.headerText1}>SANTUKA TRANSPORT</Text>
        <Text style={styles.headerText2}>
          NIE Road, Jagatpur, Cuttack- 754021.
        </Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#9c9c9c"
          placeholder="Branch"
          onChangeText={branchName => this.setState({branchName})}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#9c9c9c"
          placeholder="Clint name"
          onChangeText={clientName => this.setState({clientName})}
        />
       
        <TextInput
          style={styles.input}
          placeholderTextColor="#9c9c9c"
          placeholder="Job name"
          onChangeText={jobName => this.setState({jobName}, this.fetchJobData)}
        />

        <Text>{data}ok</Text>



        <TouchableOpacity onPress={this.showDatePicker}>
          <Text style={styles.dateText}>
            Selected Date: {moment(selectedDate).format('DD/MM/YYYY')}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={selectedDate}
            mode="date"
            display="default"
            onChange={this.handleDateChange}
          />
        )}
        <Button title="Load Data" onPress={this.loadData} />
        <ScrollView horizontal={true}>
          <Table borderStyle={styles.tableBorder}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            {dataAvailable ? (
              tableData.map((rowData, index) => (
                <Row
                  key={index}
                  data={[
                    ++this.serialNumber,
                    rowData['TruckNo'] || '',
                    rowData['Challan'] || '',
                    rowData['Loading Qty'] || '',
                    rowData['Unloading Qty'] || '',
                    rowData['Unloading Date']
                      ? moment(rowData['Unloading Date']).format('DD-MM-YYYY')
                      : '',
                    rowData['Cash'] || '',
                    rowData['E-Adv'] || '',
                    rowData['Hsd'] || '',
                    rowData['Pump Name'] || '',
                    rowData['Remarks'] || '',
                  ]}
                  style={styles.row}
                  textStyle={styles.text}
                />
              ))
            ) : (
              <Text style={styles.data}>No data available</Text>
            )}
          </Table>
        </ScrollView>
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={this.loadPreviousPage}
            disabled={currentPage <= 1}>
            <Text style={styles.paginationButton}>Previous</Text>
          </TouchableOpacity>
          <Text style={styles.paginationText}>Page {currentPage}</Text>
          <TouchableOpacity onPress={this.loadNextPage}>
            <Text style={styles.paginationButton}>Next</Text>
          </TouchableOpacity>
        </View>
        <Button title="Print PDF" onPress={this.handlePrintPDF} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#b6ccf2',
    borderWidth: 2,
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 8,
    color: '#000',
  },
  scrol: {
    height: 40,
    borderColor: '#b6ccf2',
    borderWidth: 2,
    borderRadius: 7,
    marginBottom: 10,
    paddingHorizontal: 8,
    color: '#000',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#007BFF',
  },
  data: {
    fontSize: 20,
    color: '#007BFF',
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#bfd7ff',
  },
  head: {
    height: 50,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    color: '#000',
    width: 100,
    textAlign: 'center',
  },
  row: {
    height: 30,
    backgroundColor: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  paginationButton: {
    color: '#007BFF',
  },
  paginationText: {
    fontSize: 16,
  },
  headerText1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  headerText2: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  border: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dash: {
    width: 10,
    height: 3,
    backgroundColor: '#000',
    marginRight: 5,
    marginTop: 5,
  },
});
