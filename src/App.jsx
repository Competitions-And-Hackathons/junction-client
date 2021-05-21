// basic react system
import React, { Component}  from 'react';
import './App.css';

// AWS 
import Amplify, {API, graphqlOperation}from 'aws-amplify';
import awsconfig from './aws-exports';
import {AmplifySignOut, withAuthenticator} from '@aws-amplify/ui-react';

// AWS APIs
import {listMMRs, listSessionWaitings, listSessionMatchings, listOnGameSessions} from './graphql/queries'
import {createMMR, createSessionWaiting, deleteSessionWaiting, createSessionMatching, deleteSessionMatching, createOnGameSession, updateOnGameSession, deleteOnGameSession} from './graphql/mutations'

//uuid
import {v4 as uuid} from 'uuid'

//UIs
import { TextField } from '@material-ui/core';

Amplify.configure(awsconfig);

class App extends Component {
  constructor(props){
    super(props);
    this.state  = {
      client_state : "init"
    }
  }
  sleep(delay){
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
  }

  changeState(new_state){
    this.setState(
      {
        client_state : new_state
      }
    );
  }

  loginGame(){
    this.changeState("login");
  }

  async getMMR(){
    const MMRList = await API.graphql(graphqlOperation(listMMRs))
    let MMRListItems =  MMRList.data.listMMRs.items;

    const my_mmr = MMRListItems.find(MMRItem => MMRItem.userid === this.state.username)

    if (my_mmr){
      this.setState({mmr : my_mmr.mmr})
    }
    else{
      const newMMRInput = {
        "id": uuid(),
        "userid":this.state.username,
        "mmr":10
      }
  
      await API.graphql(graphqlOperation(createMMR, {input: newMMRInput}));
      this.setState({mmr : 10})
    }
    
  }

  async buildSession(){
    await this.getMMR();

    const newSessionWaitingInput = {
      "id": uuid(),
      "userid":this.state.username,
      "mmr":this.state.mmr
    }
    await API.graphql(graphqlOperation(createSessionWaiting, {input: newSessionWaitingInput}));
    this.changeState("session");

  
    const sessionWaitingResponse = await API.graphql(graphqlOperation(listSessionWaitings));
    let sessionWaiting =  sessionWaitingResponse.data.listSessionWaitings.items;

    //4명 이상이 대기 중이면
    if (sessionWaiting.length >= 4){
      
      sessionWaiting.sort((a, b) => (a.mmr > b.mmr) ? -1 : 1);

      const gameid = uuid();
      
      for (let player_index = 0; player_index < 4; player_index++){

        //delete waiting
        const deleteSessionWaitingInput = {
          "id": sessionWaiting[player_index].id,
        }
        await API.graphql(graphqlOperation(deleteSessionWaiting, {input: deleteSessionWaitingInput}));

        //create matching
        const createSessionMatchingInput = {
          "id": uuid(),
          "userid": sessionWaiting[player_index].userid,
          "gameid": gameid
        }
        await API.graphql(graphqlOperation(createSessionMatching, {input: createSessionMatchingInput}));

      }

      const createOnGameSessionInput = {
        "id": gameid,
        "player1_id": sessionWaiting[0].userid,
        "player1_x": 0,
        "player2_id": sessionWaiting[1].userid,
        "player2_x": 0,
        "player3_id": sessionWaiting[2].userid,
        "player3_x": 0,
        "player4_id": sessionWaiting[3].userid,
        "player4_x": 0,
      }
      await API.graphql(graphqlOperation(createOnGameSession, {input: createOnGameSessionInput}));

    }

  }

  getGameSettingData = ()=>{
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");

    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({"data":"dummy"});
    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    // make API call with parameters and use promises to get response
    fetch("https://69hpl4j6x9.execute-api.ap-northeast-2.amazonaws.com/dev", requestOptions)
    .then(response => response.text())    
    .then(result => (this.setState({gameSetting: JSON.parse(result).body})))
    .catch(error => console.log('error', error))
  }


  async checkSession(){
    const SessionMatchingsList = await API.graphql(graphqlOperation(listSessionMatchings))
    let SessionMatchingItems =  SessionMatchingsList.data.listSessionMatchings.items;

    const my_matching = SessionMatchingItems.find(SessionMatchingItem => SessionMatchingItem.userid === this.state.username)

    if (my_matching){
      this.setState({gameid : my_matching.gameid});

      //delete waiting
      const deleteSessionMatchingInput = {
        "id": my_matching.id,
      }
      await API.graphql(graphqlOperation(deleteSessionMatching, {input: deleteSessionMatchingInput}));
      
      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      console.log(OnGameSessionsListItems);
      console.log(this.state.gameid);

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

      this.setState({player1_id : my_game.player1_id});
      this.setState({player2_id : my_game.player2_id});
      this.setState({player3_id : my_game.player3_id});
      this.setState({player4_id : my_game.player4_id});

      this.setState({player1_x : parseInt(my_game.player1_x)});
      this.setState({player2_x : parseInt(my_game.player2_x)});
      this.setState({player3_x : parseInt(my_game.player3_x)});
      this.setState({player4_x : parseInt(my_game.player4_x)});


      if (this.state.username === this.state.player1_id){
        this.setState({my_number : 1});
      }
      else if (this.state.username === this.state.player2_id){
        this.setState({my_number : 2});
      }
      else if (this.state.username === this.state.player3_id){
        this.setState({my_number : 3});
      }
      else if (this.state.username === this.state.player4_id){
        this.setState({my_number : 4});
      }



      this.getGameSettingData()

      this.changeState("playing");
    }
  }

  async loadGameData(){
    const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
    let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

    const my_game = OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

    this.setState({player1_x : parseInt(my_game.player1_x)});
    this.setState({player2_x : parseInt(my_game.player2_x)});
    this.setState({player3_x : parseInt(my_game.player3_x)});
    this.setState({player4_x : parseInt(my_game.player4_x)});
  }

  async moveChatacter(){
    await this.loadGameData();
    
    console.log(this.state.player1_x + parseInt(this.state.gameSetting[0].speed))

    if (this.state.my_number == 1){

      console.log("access inside");

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

      console.log(my_game);

      my_game.player1_x = my_game.player1_x + this.state.gameSetting[0].speed;

      console.log(my_game);

      delete my_game.createdAt;
      delete my_game.updatedAt;

      console.log(my_game);

      const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

      console.log(updated_game);
      

      //
      
    }

  }

  

  render(){
    if (this.state.client_state === "init"){
      return (
        <div className="App">
          <header className="App-header">
  
            <h1>Start Game</h1>
            <div className="custom_button" onClick={()=> this.loginGame()}> Start Game </div> 
  
            <h1>Go to Dash Board</h1>
            <div className="custom_button"> Dash Board </div> 
  
    
            <h1>Log Out</h1>
            <AmplifySignOut/>
          </header>
        </div>
      );
    }
    else if (this.state.client_state === "login"){
      return (
        <div className="App">
          <header className="App-header">
  
          <div className="text_field"> username : 
            <TextField value={this.state.username} onChange={e => this.setState({username : e.target.value})}/> 
          </div>

          <div className="custom_button" onClick={()=> this.buildSession()}> Go! </div> 
            
          </header>
        </div>
      );
    }
    else if (this.state.client_state === "session"){
      return (
        <div className="App">
          <header className="App-header">
  
            <h1>Waiting for Session...</h1>
            <div className="custom_button" onClick={()=> this.checkSession()}> ReLoad Game Session </div> 
            
          </header>
        </div>
      );
    }
    else if (this.state.client_state === "playing"){
      return (

        <header>
          
          <div className="tracks">
            <div className="track_info_line"></div>
            <div className="track_info_line"></div>

            <div className="track_info_line">
              <span className="track_info_text">SKILL</span>
              <span className="track_info_text_has_margin">SKILL</span>
              <span className="track_info_text_has_margin">SKILL</span>
              <span className="track_info_text_has_margin">SKILL</span>
              <span className="track_info_text_has_margin">WIN!!</span>

            </div>

            <div className="track_line"></div>
            
            <div className="track">
              <span className="player-container">
                <img src="./resource/images/running.png" alt="" className="runner_img" ></img>
              </span>
            </div>
            
            <div className="track_line"></div>
            <div className="track">
              <span className="player-container">
                <img src="./resource/images/running.png" alt="" className="runner_img" ></img>
              </span>
            </div>
            
            <div className="track_line"></div>
            <div className="track">
              <span className="player-container">
                <img src="./resource/images/running.png" alt="" className="runner_img" ></img>
              </span>
            </div>

            <div className="track_line"></div>
            <div className="track">
              <span className="player-container">
                <img src="./resource/images/running.png" alt="" className="runner_img" ></img>
              </span>
            </div>
            <div className="track_line"></div>

            <div className="track_info_line"></div>
            <div className="track_info_line"></div>
          </div>

          <div className="row">
            <div className="column">
              Hello
            </div>
            <div className="column">
              <div className="custom_button" onClick={()=> this.moveChatacter()}> MOVE!!!</div>
            </div>
          </div>

          <div className="player_rank">
            <span className="rank" font-size>1.</span>
          </div>


          <div className="skill_box_first">
            <span className="skill_R" font-size>R</span>
          </div>

          <div className="skill_box">
            <span className="skill_E" font-size>E</span>
          </div>

          <div className="skill_box">
            <span className="skill_W" font-size>W</span>
          </div>

          <div className="skill_box">
            <span className="skill_Q" font-size>Q</span>
          </div>
        </header>

        
        
 
      );
    }
    else if (this.state.client_state === "endgame"){
      return (
        <div className="App">
          <h1>Game Ended</h1>
        </div>
      );
    }
  }
}

export default withAuthenticator(App);