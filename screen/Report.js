import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Button,
  ScrollView,
} from 'react-native';
import CustomDropdown from './components/CustomDropdown';
import moment from 'moment';
import {encode} from 'base-64';
import {Table, Row} from 'react-native-table-component';
import DateTimePicker from '@react-native-community/datetimepicker';




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
      currentPage: 1,
      perPage: 100,
      jobData: [],
      branchData: [],
      clintData: [],
      tableData: [],
      jobName: '',
      branchName: '',
      clientName: '',
      selectedDate: new Date(),
      base64Credentials: '',
      showDropdown: false,
      searchText: '',
      input: '',
      branchInput: '',
      clintInput: '',
      columnDataMapping: {
        'Loading Qty': 'NetWT',
      },
      username: route.params?.username || '',
      password: route.params?.password || '',
      showDatePicker: false,
    };
    this.debounceTimeout = null;
    this.serialNumber = 0;
    this.handlePrintPDF = this.handlePrintPDF.bind(this);
    this.calculateSum = this.calculateSum.bind(this);
  }

  fetchClintData = () => {
    const apiUrl = `https://mis.santukatransport.in/API/Test/GetClientDetails?ClinetName=${this.state.clintInput}`;
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.state.base64Credentials}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const clintArray = data?.data.map(clint => ({
          label: clint.label,
          value: clint.value,
        }));

        console.log(response, 'wkkwk');
        this.setState({clintData: clintArray});
      })
      .catch(error => console.error('Error fetching branch data:', error));
  };

  fetchBranchData = () => {
    const apiUrl = `https://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${this.state.branchInput}`;
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.state.base64Credentials}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const branchArray = data?.data.map(branch => ({
          label: branch.label,
          value: branch.value,
        }));
        this.setState({branchData: branchArray});
      })
      .catch(error => console.error('Error fetching branch data:', error));
  };

  fetchJobData = () => {
    const apiUrl = `https://mis.santukatransport.in/API/Test/GetJobDetails?JobNo=${this.state.input}`;
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.state.base64Credentials}`,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        const jobArray = data?.data.map(job => ({
          label: job.JobNo,
          value: job.JobNo,
        }));
        this.setState({jobData: jobArray});
      })
      .catch(error => {
        console.error('Error fetching job data:', error);
      });
  };

  handleDropdownClint = selectedJob => {
    clearTimeout(this.debounceTimeout); // Cancel any ongoing debounce
    this.setState({
      clintInput: selectedJob,
      clientName: selectedJob,
      showDropdown: false,
    });

    console.log('Selected Job:', selectedJob);
  };

  handleDropdownBranch = selectedJob => {
    clearTimeout(this.debounceTimeout);
    this.setState({
      branchInput: selectedJob,
      branchName: selectedJob,
      showDropdown: false,
    });

    console.log('Selected Job:', selectedJob);
  };

  handleDropdownSelect = selectedJob => {
    clearTimeout(this.debounceTimeout); // Cancel any ongoing debounce
    this.setState({
      input: selectedJob,
      jobName: selectedJob,
      showDropdown: false,
    });

    console.log('Selected Job:', selectedJob);
  };

  componentDidMount() {
    this.loadData();
    this.fetchJobData();
    this.fetchBranchData();
    this.fetchClintData();
  }

  loadData = () => {
    const {
      currentPage,
      perPage,
      branchName,
      clientName,
      jobName,
      selectedDate,
      username,
      password,
    } = this.state;

    const base64Credentials = encode(`${username}:${password}`);

    const headers = new Headers({
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
    });

    // Calculate pagination range
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;

    // Format the selected date for the API
    const formattedSelectedDate = selectedDate
      ? moment(selectedDate).format('YYYY-MM-DD')
      : '';

    // Build the API URL dynamically based on selected filters
    let apiUrl = `https://mis.santukatransport.in/API/Test/GetData?`;

    // Append query parameters based on selected filters
    if (branchName) {
      apiUrl += `BranchName=${branchName}&`;
    }
    if (clientName) {
      apiUrl += `ClientName=${clientName}&`;
    }
    if (jobName) {
      apiUrl += `JobNo=${jobName}&`;
    }
    if (formattedSelectedDate) {
      apiUrl += `Date=${formattedSelectedDate}&`;
    }

    // If no filters are selected, return early to avoid making unnecessary requests
    if (!branchName && !clientName && !jobName && !formattedSelectedDate) {
      console.log('No filters selected. Please select at least one filter.');
      return;
    }

    // Remove the trailing '&' from the API URL (if any)
    apiUrl = apiUrl.endsWith('&') ? apiUrl.slice(0, -1) : apiUrl;

    console.log('Final API URL:', apiUrl); // For debugging

    // Fetch data from the API
    fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    })
      .then(response => response.json())
      .then(data => {
        // Check if data is available
        if (data?.data && data.data.length > 0) {
          // Process the table data and update state
          const tableData = data.data.map(row => ({
            TruckNo: row.TruckNo || '',
            Challan: row.Challan || '',
            TPNo: row.TPNo || '',
            LoadingQty: row['Loading Qty'] || '',
            UnloadingQty: row['Unloading Qty'] || '',
            UnloadingDate: row['Unloading Date']
              ? moment(row['Unloading Date']).format('DD-MM-YYYY')
              : '',
            Cash: row.Cash || '',
            EAdv: row['E-Adv'] || '',
            Hsd: row.Hsd || '',
            MemoNo: row['Memo No'] || '',
            PumpName: row['Pump Name'] || '',
            Remarks: row.Remarks || '',
          }));

          // Set the table data in state
          this.setState({
            tableData: tableData.slice(startIndex, endIndex), // Paginated data
            dataAvailable: true,
          });
        } else {
          // If no data is available, update the state accordingly
          this.setState({
            tableData: [],
            dataAvailable: false,
          });
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.setState({dataAvailable: false});
      });
  };

  // loadData = () => {
  //   this.serialNumber = 0;
  //   const {
  //     currentPage,
  //     perPage,
  //     branchName,
  //     clientName,
  //     jobName,
  //     selectedDate,
  //     username,
  //     password,
  //   } = this.state;
  //   const base64Credentials = encode(`${username}:${password}`);

  //   const headers = new Headers({
  //     Authorization: `Basic ${base64Credentials}`,
  //     'Content-Type': 'application/json',
  //   });

  //   const startIndex = (currentPage - 1) * perPage;
  //   const endIndex = startIndex + perPage;
  //   const formattedSelectedDate = `${selectedDate.getFullYear()}-${String(
  //     selectedDate.getMonth() + 1,
  //   ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  //   let apiUrl = `http://mis.santukatransport.in/API/Test/GetBranchDetails?BranchName=${branchName}`;

  //   if (clientName) {
  //     apiUrl += `&GetClientDetails?ClientName=${clientName}`;
  //   }

  //   if (jobName) {
  //     apiUrl += `&GetJobDetails?JobName=${jobName}`;
  //   }
  //   if (selectedDate) {
  //     apiUrl += `&selectedDate=${formattedSelectedDate}`;
  //   }
  //   fetch(apiUrl, {
  //     method: 'GET',
  //     headers: headers,
  //   })
  //     .then(response => response.json())
  //     .then(data => {
  //       const filteredData = data.data.filter(row => {
  //         const originalLoadDate = new Date(row['LoadDate']);
  //         const selectedDateFormatted = new Date(selectedDate);
  //         const jobNameMatch = row['JobNo'] === jobData[0].JobNo;
  //         return (
  //           originalLoadDate.toDateString() ===
  //             selectedDateFormatted.toDateString() && jobNameMatch
  //         );
  //       });
  //       // Update the table data with the filtered data
  //       this.setState({
  //         tableData: filteredData,
  //         dataAvailable: filteredData.length > 0,
  //       });
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //       this.setState({dataAvailable: false});
  //     });
  // };

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
            <td>${row['TPNo'] !== undefined ? row['TPNo'] : ''}</td>
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
            <td>${row['Memo No'] !== undefined ? row['Memo No'] : ''}</td>
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
        <CustomDropdown
          labelText="Client No"
          dropData={this.state.clintData}
          placeholdername="Select client Number"
          searchPlaceholdername="Search client Number in dropdown"
          showSearch={true}
          value={this.state.clintInput}
          onChangeText={text => this.setState({clintInput: text})}
          // onChangeText={text => {
          //   this.setState({clintInput: text});
          //   console.log(`Clint No input: ${text}`); // log the input value to console
          // }}
          onSelect={this.handleDropdownClint}
        />
        <CustomDropdown
          labelText="Branch No"
          dropData={this.state.branchData}
          placeholdername="Select Branch Number"
          searchPlaceholdername="Search Branch Number in dropdown"
          showSearch={true}
          value={this.state.branchInput}
          onChangeText={text => this.setState({branchInput: text})}
          onSelect={this.handleDropdownBranch}
        />
        <CustomDropdown
          labelText="Job No"
          dropData={this.state.jobData}
          placeholdername="Select Job Number"
          searchPlaceholdername="Search Job Number in dropdown"
          showSearch={true}
          value={this.state.input}
          onChangeText={text => this.setState({input: text})}
          onSelect={this.handleDropdownSelect}
        />
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
                    rowData['TPNo'] || '',
                    rowData['Loading Qty'] || '',
                    rowData['Unloading Qty'] || '',
                    rowData['Unloading Date']
                      ? moment(rowData['Unloading Date']).format('DD-MM-YYYY')
                      : '',
                    rowData['Cash'] || '',
                    rowData['E-Adv'] || '',
                    rowData['Hsd'] || '',
                    rowData['Memo No'] || '',
                    rowData['Pump Name'] || '',
                    rowData['Remarks'] || '',
                  ]}
                  style={styles.row}
                  textStyle={StyleSheet.flatten(styles.text)}
                />
              ))
            ) : (
              <Text>No data available</Text>
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
    borderColor: '#000',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    color: '#000',
  },
  dateText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#007BFF',
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#c8e1ff',
  },
  head: {
    height: 70,
    width: 900,
    backgroundColor: '#f1f8ff',
  },
  text: {
    margin: 6,
    color: '#000',
  },
  row: {
    height: 60,
    width: 900,
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
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
});
