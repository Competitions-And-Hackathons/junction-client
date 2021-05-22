// basic react system
import React, { Component}  from 'react';
import './App.css';

import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';

// AWS 
import Amplify, {API, graphqlOperation}from 'aws-amplify';
import awsconfig from './aws-exports';
import {AmplifySignOut, withAuthenticator} from '@aws-amplify/ui-react';

// AWS APIs
import {listMMRs, listSessionWaitings, listSessionMatchings, listOnGameSessions, listOnGameSkills} from './graphql/queries'
import {createMMR, createSessionWaiting, deleteSessionWaiting, createSessionMatching, deleteSessionMatching, createOnGameSession, updateOnGameSession, deleteOnGameSession, createOnGameSkill, updateOnGameSkill, createSkillSummary, deleteOnGameSkill} from './graphql/mutations'

//uuid
import {v4 as uuid} from 'uuid'

//UIs
import { TextField } from '@material-ui/core';

//music
import ReactHowler from 'react-howler'


Amplify.configure(awsconfig);

class App extends Component {
  constructor(props){
    super(props);
    this.state  = {
      client_state : "playing",    // "playing" for test, 원래는 "init"
      
      client_state : "init",
      skill_toggle_state : 0,
      is_used_skill : false,

      skill_name_1: "none",
      skill_name_2: "none",
      skill_name_3: "none",
      skill_name_4: "none",

      skill_dict: [
        {id: 'tanos', name: 'I LOVE YOU 1500', desc: 'Move the target back away.'},
        {id: 'backdoor', name: 'WHEREVER DOOR', desc: 'Swap position with the target.'},
        {id: 'infinite', name: 'MOOYAHOO', desc: 'Send all players back except me.'},
        {id: 'shoot', name: 'BANG', desc: ' Kill the target.'},
        {id: 'doom', name: 'DOOM', desc: "Let's die together!"}
      ],

      skill_name_1_resource: "resource/images/none.png",
      skill_name_2_resource: "resource/images/none.png",
      skill_name_3_resource: "resource/images/none.png",
      skill_name_4_resource: "resource/images/none.png",

      skill_1_background_color: "#11ffee00",
      skill_2_background_color: "#11ffee00",
      skill_3_background_color: "#11ffee00",
      skill_4_background_color: "#11ffee00",

      got_skill_1 : false,
      got_skill_2 : false,
      got_skill_3 : false,
      got_skill_4 : false,
    }
  }

  skillInfo(name){
    switch (name) {
      case "tanos":
        var arr = ['<' + this.state.skill_dict[0].name + '>', this.state.skill_dict[0].desc];
        console.log(arr.join("\n"));
        return arr.join("\n");
      case "backdoor":
        var arr = ['<' + this.state.skill_dict[1].name + '>', this.state.skill_dict[1].desc];
        console.log(arr.join("\n"));
        return arr.join("\n");
      case "infinite":
        var arr = ['<' + this.state.skill_dict[2].name + '>', this.state.skill_dict[2].desc];
        console.log(arr.join("\n"));
        return arr.join("\n");
      case "shoot":
        var arr = ['<' + this.state.skill_dict[3].name + '>', this.state.skill_dict[3].desc];
        console.log(arr.join("\n"));
        return arr.join("\n");
      case "doom":
        var arr = ['<' + this.state.skill_dict[4].name + '>', this.state.skill_dict[4].desc];
        console.log(arr.join("\n"));
        return arr.join("\n");
      default:
        return 'Waiting...'
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
    //movement sync 
    const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
    let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

    const my_game = OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

    if (my_game !== undefined){
      this.setState({player1_x : parseInt(my_game.player1_x)});
      this.setState({player2_x : parseInt(my_game.player2_x)});
      this.setState({player3_x : parseInt(my_game.player3_x)});
      this.setState({player4_x : parseInt(my_game.player4_x)});
    

 
      const OnGameSkillsList = await API.graphql(graphqlOperation(listOnGameSkills))
      let OnGameSkillsListItems =  OnGameSkillsList.data.listOnGameSkills.items;

      let skills_to_apply = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
        OnGameSkillsListItem.gameid === this.state.gameid && 
        OnGameSkillsListItem.skill_state === "casted" && 
        OnGameSkillsListItem.target_player == this.state.my_number);

        if (skills_to_apply !== undefined){
          for (let skill_index = 0; skill_index < skills_to_apply.length; skills_to_apply++){
            let skill_to_apply = skills_to_apply[skill_index];
            const apply_skill_name = skill_to_apply.skill_name;

            //skill sync 
            if (apply_skill_name === "tanos"){
              if (this.state.my_number == 1){
                this.setState({player1_x : this.state.player1_x/2});
              }

              else if (this.state.my_number == 2){
                this.setState({player2_x : this.state.player2_x/2});
              }

              else if (this.state.my_number == 3){
                this.setState({player3_x : this.state.player3_x/2});
              }

              else if (this.state.my_number == 4){
                this.setState({player4_x : this.state.player4_x/2});
              }
            }

            else if (apply_skill_name === "backdoor"){
              if (this.state.my_number == 1){
                if (skill_to_apply.source_player == 2){
                  const old_source_x = this.state.player2_x;
                  const old_target_x = this.state.player1_x;

                  this.setState({player2_x : old_target_x});
                  this.setState({player1_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 3){
                  const old_source_x = this.state.player3_x;
                  const old_target_x = this.state.player1_x;

                  this.setState({player3_x : old_target_x});
                  this.setState({player1_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 4){
                  const old_source_x = this.state.player4_x;
                  const old_target_x = this.state.player1_x;

                  this.setState({player4_x : old_target_x});
                  this.setState({player1_x : old_source_x});

                }
              }

              else if (this.state.my_number == 2){
                if (skill_to_apply.source_player == 1){
                  const old_source_x = this.state.player1_x;
                  const old_target_x = this.state.player2_x;

                  this.setState({player1_x : old_target_x});
                  this.setState({player2_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 3){
                  const old_source_x = this.state.player3_x;
                  const old_target_x = this.state.player2_x;

                  this.setState({player3_x : old_target_x});
                  this.setState({player2_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 4){
                  const old_source_x = this.state.player4_x;
                  const old_target_x = this.state.player2_x;

                  this.setState({player4_x : old_target_x});
                  this.setState({player2_x : old_source_x});

                }
              }

              else if (this.state.my_number == 3){
                if (skill_to_apply.source_player == 1){
                  const old_source_x = this.state.player1_x;
                  const old_target_x = this.state.player3_x;
    
                  this.setState({player1_x : old_target_x});
                  this.setState({player3_x : old_source_x});
    
                }
                else if (skill_to_apply.source_player == 2){
                  const old_source_x = this.state.player2_x;
                  const old_target_x = this.state.player3_x;
    
                  this.setState({player2_x : old_target_x});
                  this.setState({player3_x : old_source_x});
    
                }
                else if (skill_to_apply.source_player == 4){
                  const old_source_x = this.state.player4_x;
                  const old_target_x = this.state.player3_x;
    
                  this.setState({player4_x : old_target_x});
                  this.setState({player3_x : old_source_x});
    
                }
              }

              else  if (this.state.my_number == 4){
                if (skill_to_apply.source_player == 1){
                  const old_source_x = this.state.player1_x;
                  const old_target_x = this.state.player4_x;

                  this.setState({player1_x : old_target_x});
                  this.setState({player4_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 2){
                  const old_source_x = this.state.player2_x;
                  const old_target_x = this.state.player4_x;

                  this.setState({player2_x : old_target_x});
                  this.setState({player4_x : old_source_x});

                }
                else if (skill_to_apply.source_player == 3){
                  const old_source_x = this.state.player3_x;
                  const old_target_x = this.state.player4_x;

                  this.setState({player3_x : old_target_x});
                  this.setState({player4_x : old_source_x});

                }
              }
            }

            else if (apply_skill_name === "infinite"){
              if (this.state.my_number == 1){
                let new_x = this.state.player1_x - 200;
                if (new_x < 0){new_x = 0;}

                this.setState({player1_x : new_x});
              }

              else if (this.state.my_number == 2){
                let new_x = this.state.player2_x - 200;
                if (new_x < 0){new_x = 0;}

                this.setState({player2_x : new_x});
              }

              else if (this.state.my_number == 3){
                let new_x = this.state.player3_x - 200;
                if (new_x < 0){new_x = 0;}

                this.setState({player3_x : new_x});
              }

              else if (this.state.my_number == 4){
                let new_x = this.state.player4_x - 200;
                if (new_x < 0){new_x = 0;}

                this.setState({player4_x : new_x});
              }
            }

            else if (apply_skill_name === "shoot" || apply_skill_name === "doom"){
              if (this.state.my_number == 1){

                this.setState({got_skill_1 : 0});
                this.setState({got_skill_2 : 0});
                this.setState({got_skill_3 : 0});
                this.setState({got_skill_4 : 0});

                this.setState({player1_x : 0});
              }

              else if (this.state.my_number == 2){

                this.setState({got_skill_1 : 0});
                this.setState({got_skill_2 : 0});
                this.setState({got_skill_3 : 0});
                this.setState({got_skill_4 : 0});

                this.setState({player2_x : 0});
              }

              else if (this.state.my_number == 3){

                this.setState({got_skill_1 : 0});
                this.setState({got_skill_2 : 0});
                this.setState({got_skill_3 : 0});
                this.setState({got_skill_4 : 0});

                this.setState({player3_x : 0});
              }

              else if (this.state.my_number == 4){

                this.setState({got_skill_1 : 0});
                this.setState({got_skill_2 : 0});
                this.setState({got_skill_3 : 0});
                this.setState({got_skill_4 : 0});

                this.setState({player4_x : 0});
              }
            }


            skill_to_apply.skill_state = "applied"

            delete skill_to_apply.createdAt;
            delete skill_to_apply.updatedAt;

            await API.graphql(graphqlOperation(updateOnGameSkill, {input:skill_to_apply}))
          }
        }

    }
    else{
      this.setState({isWinng : false});
      this.changeState("endgame");
    }

  }

  async moveChatacter(){
    await this.loadGameData();
    
    if (this.state.my_number == 1){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

      if (my_game!==undefined){
        my_game.player1_x = this.state.player1_x + this.state.gameSetting[0].speed;


        delete my_game.createdAt;
        delete my_game.updatedAt;


        const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

        this.setState({player1_x : parseInt(my_game.player1_x)});
      }
      else{
        this.setState({isWinng : false});
        this.changeState("endgame");
      }
      
    }

    else if (this.state.my_number == 2){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions));
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid);

      if (my_game!==undefined){

        my_game.player2_x = this.state.player2_x + this.state.gameSetting[0].speed;


        delete my_game.createdAt;
        delete my_game.updatedAt;


        const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

        this.setState({player2_x : parseInt(my_game.player2_x)});
      }
      else{
        this.setState({isWinng : false});
        this.changeState("endgame");
      }
    }

    else if (this.state.my_number == 3){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions));
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid);

      if (my_game!==undefined){


        my_game.player3_x = this.state.player3_x + this.state.gameSetting[0].speed;


        delete my_game.createdAt;
        delete my_game.updatedAt;


        const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

        this.setState({player3_x : parseInt(my_game.player3_x)});
      }
      else{
        this.setState({isWinng : false});
        this.changeState("endgame");
      }
    }

    else if (this.state.my_number == 4){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)

      if (my_game!==undefined){


        my_game.player4_x = this.state.player4_x + this.state.gameSetting[0].speed;


        delete my_game.createdAt;
        delete my_game.updatedAt;


        const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

        this.setState({player4_x : parseInt(my_game.player4_x)});
      }
      else{
        this.setState({isWinng : false});
        this.changeState("endgame");
      }
    }

    await this.checkGetSkill()

  }

  async changeTogggle(skill_toggle_index){
    if (skill_toggle_index == 1){
      if (this.state.skill_name_1 == "infinite"){
        if (this.state.my_number != 1){
          await this.spell_skill("infinite", 1);
        }
        if (this.state.my_number != 2){
          await this.spell_skill("infinite", 2);
        }
        if (this.state.my_number != 3){
          await this.spell_skill("infinite", 3);
        }
        if (this.state.my_number != 4){
          await this.spell_skill("infinite", 4);
        }
      }
      else if (this.state.skill_name_1 == "doom"){
        await this.spell_skill("doom", 1);
        await this.spell_skill("doom", 2);
        await this.spell_skill("doom", 3);
        await this.spell_skill("doom", 4);
      }
      else{
        this.setState({skill_toggle_state: skill_toggle_index});

        this.setState({skill_1_background_color: "#DD9C9C"});
        this.setState({skill_2_background_color: "#DD9C9C"});
        this.setState({skill_3_background_color: "#DD9C9C"});
        this.setState({skill_4_background_color: "#DD9C9C"});
      }
    }

    else if (skill_toggle_index == 2){
      if (this.state.skill_name_2 == "infinite"){
        if (this.state.my_number != 1){
          await this.spell_skill("infinite", 1);
        }
        if (this.state.my_number != 2){
          await this.spell_skill("infinite", 2);
        }
        if (this.state.my_number != 3){
          await this.spell_skill("infinite", 3);
        }
        if (this.state.my_number != 4){
          await this.spell_skill("infinite", 4);
        }
      }
      else if (this.state.skill_name_2 == "doom"){
        await this.spell_skill("doom", 1);
        await this.spell_skill("doom", 2);
        await this.spell_skill("doom", 3);
        await this.spell_skill("doom", 4);
      }
      else{
        this.setState({skill_toggle_state: skill_toggle_index});

        this.setState({skill_1_background_color: "#DD9C9C"});
        this.setState({skill_2_background_color: "#DD9C9C"});
        this.setState({skill_3_background_color: "#DD9C9C"});
        this.setState({skill_4_background_color: "#DD9C9C"});
      }
    }

    else if (skill_toggle_index == 3){
      if (this.state.skill_name_3 == "infinite"){
        if (this.state.my_number != 1){
          await this.spell_skill("infinite", 1);
        }
        if (this.state.my_number != 2){
          await this.spell_skill("infinite", 2);
        }
        if (this.state.my_number != 3){
          await this.spell_skill("infinite", 3);
        }
        if (this.state.my_number != 4){
          await this.spell_skill("infinite", 4);
        }
      }
      else if (this.state.skill_name_3 == "doom"){
        await this.spell_skill("doom", 1);
        await this.spell_skill("doom", 2);
        await this.spell_skill("doom", 3);
        await this.spell_skill("doom", 4);
      }
      else{
        this.setState({skill_toggle_state: skill_toggle_index});

        this.setState({skill_1_background_color: "#DD9C9C"});
        this.setState({skill_2_background_color: "#DD9C9C"});
        this.setState({skill_3_background_color: "#DD9C9C"});
        this.setState({skill_4_background_color: "#DD9C9C"});
      }
    }

    else if (skill_toggle_index == 4){
      if (this.state.skill_name_4 == "infinite"){
        if (this.state.my_number != 1){
          await this.spell_skill(skill_toggle_index, 1);
        }
        if (this.state.my_number != 2){
          await this.spell_skill(skill_toggle_index, 2);
        }
        if (this.state.my_number != 3){
          await this.spell_skill(skill_toggle_index, 3);
        }
        if (this.state.my_number != 4){
          await this.spell_skill(skill_toggle_index, 4);
        }
      }
      else if (this.state.skill_name_4 == "doom"){
        await this.spell_skill("doom", 1);
        await this.spell_skill("doom", 2);
        await this.spell_skill("doom", 3);
        await this.spell_skill("doom", 4);
      }
      else{
        this.setState({skill_toggle_state: skill_toggle_index});

        this.setState({skill_1_background_color: "#DD9C9C"});
        this.setState({skill_2_background_color: "#DD9C9C"});
        this.setState({skill_3_background_color: "#DD9C9C"});
        this.setState({skill_4_background_color: "#DD9C9C"});
      }
    }

  }

  async checkGetSkill(){
    if (this.state.my_number == 1){
      if ((this.state.player1_x >= 0) && (this.state.got_skill_1 == false)){
        this.resetSkills();
        this.state.got_skill_1 = true;
      }
      else if ((this.state.player1_x >= 222) && (this.state.got_skill_2 == false)){
        this.resetSkills();
        this.state.got_skill_2 = true;
      }
      else if ((this.state.player1_x >= 450) && (this.state.got_skill_3 == false)){
        this.resetSkills();
        this.state.got_skill_3 = true;
      }
      else if ((this.state.player1_x >= 670) && (this.state.got_skill_4 == false)){
        this.resetSkills();
        this.state.got_skill_4 = true;
      }
      else if ((this.state.player1_x >= 900)){
        this.winGame();
      }
    }

    else if (this.state.my_number == 2){
      if ((this.state.player2_x >= 0) && (this.state.got_skill_1 == false)){
        this.resetSkills();
        this.state.got_skill_1 = true;
      }
      else if ((this.state.player2_x >= 222) && (this.state.got_skill_2 == false)){
        this.resetSkills();
        this.state.got_skill_2 = true;
      }
      else if ((this.state.player2_x >= 450) && (this.state.got_skill_3 == false)){
        this.resetSkills();
        this.state.got_skill_3 = true;
      }
      else if ((this.state.player2_x >= 670) && (this.state.got_skill_4 == false)){
        this.resetSkills();
        this.state.got_skill_4 = true;
      }
      else if ((this.state.player2_x >= 900)){
        this.winGame();
      }
    }

    else if (this.state.my_number == 3){
      if ((this.state.player3_x >= 0) && (this.state.got_skill_1 == false)){
        this.resetSkills();
        this.state.got_skill_1 = true;
      }
      else if ((this.state.player3_x >= 222) && (this.state.got_skill_2 == false)){
        this.resetSkills();
        this.state.got_skill_2 = true;
      }
      else if ((this.state.player3_x >= 450) && (this.state.got_skill_3 == false)){
        this.resetSkills();
        this.state.got_skill_3 = true;
      }
      else if ((this.state.player3_x >= 670) && (this.state.got_skill_4 == false)){
        this.resetSkills();
        this.state.got_skill_4 = true;
      }
      else if ((this.state.player3_x >= 900)){
        this.winGame();
      }
    }

    else if (this.state.my_number == 4){
      if ((this.state.player4_x >= 0) && (this.state.got_skill_1 == false)){
        this.resetSkills();
        this.state.got_skill_1 = true;
      }
      else if ((this.state.player4_x >= 222) && (this.state.got_skill_2 == false)){
        this.resetSkills();
        this.state.got_skill_2 = true;
      }
      else if ((this.state.player4_x >= 450) && (this.state.got_skill_3 == false)){
        this.resetSkills();
        this.state.got_skill_3 = true;
      }
      else if ((this.state.player4_x >= 670) && (this.state.got_skill_4 == false)){
        this.resetSkills();
        this.state.got_skill_4 = true;
      }
      else if ((this.state.player4_x >= 900)){
        this.winGame();
      }
    }
  }
  
  resetSkills(){

      let random_int = Math.random() * (100)

      if (random_int <= this.state.gameSetting[0].tanos){
        this.setState({skill_name_1: "tanos"});

      }

      else{
        random_int -= this.state.gameSetting[0].tanos;

        if (random_int <= this.state.gameSetting[0].backdoor){
          this.setState({skill_name_1: "backdoor"});

        }

        else{
          random_int -= this.state.gameSetting[0].backdoor;

          if (random_int <= this.state.gameSetting[0].infinite){
            this.setState({skill_name_1: "infinite"});

          }

          else {
            random_int -= this.state.gameSetting[0].infinite;

            if (random_int <= this.state.gameSetting[0].shoot){
              this.setState({skill_name_1: "shoot"});

            }

            else {
              this.setState({skill_name_1: "doom"});
            }

          }
        }
      }


      random_int = Math.random() * (100)

      if (random_int <= this.state.gameSetting[0].tanos){
        this.setState({skill_name_2: "tanos"});

      }

      else{
        random_int -= this.state.gameSetting[0].tanos;

        if (random_int <= this.state.gameSetting[0].backdoor){
          this.setState({skill_name_2: "backdoor"});

        }

        else{
          random_int -= this.state.gameSetting[0].backdoor;

          if (random_int <= this.state.gameSetting[0].infinite){
            this.setState({skill_name_2: "infinite"});

          }

          else {
            random_int -= this.state.gameSetting[0].infinite;

            if (random_int <= this.state.gameSetting[0].shoot){
              this.setState({skill_name_2: "shoot"});

            }

            else {
              this.setState({skill_name_2: "doom"});
            }

          }
        }
      }



      random_int = Math.random() * (100)

      if (random_int <= this.state.gameSetting[0].tanos){
        this.setState({skill_name_3: "tanos"});

      }

      else{
        random_int -= this.state.gameSetting[0].tanos;

        if (random_int <= this.state.gameSetting[0].backdoor){
          this.setState({skill_name_3: "backdoor"});

        }

        else{
          random_int -= this.state.gameSetting[0].backdoor;

          if (random_int <= this.state.gameSetting[0].infinite){
            this.setState({skill_name_3: "infinite"});

          }

          else {
            random_int -= this.state.gameSetting[0].infinite;

            if (random_int <= this.state.gameSetting[0].shoot){
              this.setState({skill_name_3: "shoot"});

            }

            else {
              this.setState({skill_name_3: "doom"});
            }

          }
        }
      }

      random_int = Math.random() * (100)

      if (random_int <= this.state.gameSetting[0].tanos){
        this.setState({skill_name_4: "tanos"});

      }

      else{
        random_int -= this.state.gameSetting[0].tanos;

        if (random_int <= this.state.gameSetting[0].backdoor){
          this.setState({skill_name_4: "backdoor"});

        }

        else{
          random_int -= this.state.gameSetting[0].backdoor;

          if (random_int <= this.state.gameSetting[0].infinite){
            this.setState({skill_name_4: "infinite"});

          }

          else {
            random_int -= this.state.gameSetting[0].infinite;

            if (random_int <= this.state.gameSetting[0].shoot){
              this.setState({skill_name_4: "shoot"});

            }

            else {
              this.setState({skill_name_4: "doom"});
            }

          }
        }
      }

      this.reset_skill_resource_path();
  }
  
  reset_skill_resource_path(){
      this.setState({skill_name_1_resource: "resource/images/" + this.state.skill_name_1 + ".png"});
      this.setState({skill_name_2_resource: "resource/images/" + this.state.skill_name_2 + ".png"});
      this.setState({skill_name_3_resource: "resource/images/" + this.state.skill_name_3 + ".png"});
      this.setState({skill_name_4_resource: "resource/images/" + this.state.skill_name_4 + ".png"});

      this.setState({skill_1_background_color: "#11ffee00"});
      this.setState({skill_2_background_color: "#11ffee00"});
      this.setState({skill_3_background_color: "#11ffee00"});
      this.setState({skill_4_background_color: "#11ffee00"});
  }

  async spell_skill(skill_name, target_player){

    const newSkillInput = {
      "id": uuid(),
      "gameid":this.state.gameid,
      "skill_name":skill_name,
      "skill_state": "casted",
      "source_player":this.state.my_number,
      "target_player":target_player
    }
    
    await API.graphql(graphqlOperation(createOnGameSkill, {input: newSkillInput}));
    

    this.setState({skill_name_1: "none"});
    this.setState({skill_name_2: "none"});
    this.setState({skill_name_3: "none"});
    this.setState({skill_name_4: "none"});
    this.reset_skill_resource_path();
  }

  async spell_on_player(target_player){
    if (this.state.skill_toggle_state == 1){
      await this.spell_skill(this.state.skill_name_1, target_player);
    } 

    else if (this.state.skill_toggle_state == 2){
      await this.spell_skill(this.state.skill_name_2, target_player);
    } 

    else if (this.state.skill_toggle_state == 3){
      await this.spell_skill(this.state.skill_name_3, target_player);
    } 

    else if (this.state.skill_toggle_state == 4){
      await this.spell_skill(this.state.skill_name_4, target_player);
    } 

    
  }

  async winGame(){
    const OnGameSkillsList = await API.graphql(graphqlOperation(listOnGameSkills))
      let OnGameSkillsListItems =  OnGameSkillsList.data.listOnGameSkills.items;

      for (let player_number = 1; player_number <= 4; player_number++){

        let sourced_tanos_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "tanos" && 
          OnGameSkillsListItem.source_player == player_number);
        
        let sourced_tanos = 0;
        if (sourced_tanos_items.length > 0){
          sourced_tanos = sourced_tanos_items.length
        }


        let sourced_backdoor_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "backdoor" && 
          OnGameSkillsListItem.source_player == player_number);
        
        let sourced_backdoor = 0;
        if (sourced_backdoor_items.length > 0){
          sourced_backdoor = sourced_backdoor_items.length
        }


        let sourced_infinite_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "infinite" && 
          OnGameSkillsListItem.source_player == player_number);
        
        let sourced_infinite = 0;
        if (sourced_infinite_items.length > 0){
          sourced_infinite = sourced_infinite_items.length
        }


        let sourced_shoot_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "shoot" && 
          OnGameSkillsListItem.source_player == player_number);
        
        let sourced_shoot = 0;
        if (sourced_shoot_items.length > 0){
          sourced_shoot = sourced_shoot_items.length
        }



        let sourced_doom_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "doom" && 
          OnGameSkillsListItem.source_player == player_number);
        
        let sourced_doom = 0;
        if (sourced_doom_items.length > 0){
          sourced_doom = sourced_doom_items.length
        }


        let targeted_tanos_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "tanos" && 
          OnGameSkillsListItem.target_player == player_number);
        
        let targeted_tanos = 0;
        if (targeted_tanos_items.length > 0){
          targeted_tanos = targeted_tanos_items.length
        }


        let targeted_backdoor_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "backdoor" && 
          OnGameSkillsListItem.target_player == player_number);
        
        let targeted_backdoor = 0;
        if (targeted_backdoor_items.length > 0){
          targeted_backdoor = targeted_backdoor_items.length
        }


        let targeted_infinite_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "infinite" && 
          OnGameSkillsListItem.target_player == player_number);
        
        let targeted_infinite = 0;
        if (targeted_infinite_items.length > 0){
          targeted_infinite = targeted_infinite_items.length
        }


        let targeted_shoot_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "shoot" && 
          OnGameSkillsListItem.target_player == player_number);
        
        let targeted_shoot = 0;
        if (targeted_shoot_items.length > 0){
          targeted_shoot = targeted_shoot_items.length
        }


        let targeted_doom_items = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
          OnGameSkillsListItem.gameid === this.state.gameid && 
          OnGameSkillsListItem.skill_state === "applied" && 
          OnGameSkillsListItem.skill_name === "doom" && 
          OnGameSkillsListItem.target_player == player_number);
        
        let targeted_doom = 0;
        if (targeted_doom_items.length > 0){
          targeted_doom = targeted_doom_items.length
        }

        let last_x = 0;
        if (player_number == 1){
          last_x = this.state.player1_x;
        }

        else if (player_number == 2){
          last_x = this.state.player2_x;
        }

        else if (player_number == 3){
          last_x = this.state.player3_x;
        }

        else if (player_number == 4){
          last_x = this.state.player4_x;
        }

        const clear_rate = last_x / 900.0;

        const newSkillSummaryInput = {
          "id": uuid(),
          "gameid":this.state.gameid,
          "clear_rate":clear_rate,
          "sourced_tanos": sourced_tanos,
          "sourced_backdoor": sourced_backdoor,
          "sourced_infinite": sourced_infinite,
          "sourced_shoot": sourced_shoot,
          "sourced_doom": sourced_doom,
          "targeted_tanos": targeted_tanos,
          "targeted_backdoor": targeted_backdoor,
          "targeted_infinite": targeted_infinite,
          "targeted_shoot": targeted_shoot,
          "targeted_doom": targeted_doom,
        }
        
        await API.graphql(graphqlOperation(createSkillSummary, {input: newSkillSummaryInput}));
      }

      let deleteSkillsListItems = OnGameSkillsListItems.filter(OnGameSkillsListItem => 
        OnGameSkillsListItem.gameid === this.state.gameid);

      for(let skill_index=0; skill_index < deleteSkillsListItems.length; skill_index++){
        const deleteOnGameSkillInput = {
          "id": deleteSkillsListItems[skill_index].id,
        }
        await API.graphql(graphqlOperation(deleteOnGameSkill, {input: deleteOnGameSkillInput}));
      }

      const deleteOnGameSessionInput = {
        "id": this.state.gameid
      }
      await API.graphql(graphqlOperation(deleteOnGameSession, {input: deleteOnGameSessionInput}));
  
      this.setState({isWinng : true});
      this.changeState("endgame");

  }  

  render(){
    var Enemy1 = "Enemy";
    var Enemy2 = "Enemy";
    var Enemy3 = "Enemy";
    var Enemy4 = "Enemy";

    var rank = ["1st", "1st", "1st", "1st"];
    var player_x = [this.state.player1_x, this.state.player2_x, this.state.player3_x, this.state.player4_x];
    var sort_x = [this.state.player1_x, this.state.player2_x, this.state.player3_x, this.state.player4_x];

    

    if (this.state.player1_id === this.state.username){
      Enemy1 = "You";
    }
    else if (this.state.player2_id === this.state.username){
      Enemy2 = "You";
    }
    else if (this.state.player3_id === this.state.username){
      Enemy3 = "You";
    }
    else if (this.state.player4_id === this.state.username){
      Enemy4 = "You";
    }

    sort_x.sort()
    for (var i=0; i<player_x.length; i++){
      if (sort_x[3] === player_x[i]){
        rank[i] = "1st";
      }
      else if (sort_x[2] === player_x[i]){
        rank[i] = "2nd";
      }
      else if (sort_x[1] === player_x[i]){
        rank[i] = "3rd";
      }
      else if (sort_x[0] === player_x[i]){
        rank[i] = "4th";
      } 
    }

    if (this.state.client_state === "init"){
      return (
        <div className="App">
          <header className="App-header">
  
            <h1>Start Game</h1>
            <div className="custom_button" onClick={()=> this.loginGame()}> Start Game </div> 
  
            <h1>Go to Dash Board</h1>
            <div className="custom_button">
              <a href="https://ljz8006s1e.execute-api.ap-northeast-2.amazonaws.com/test/dashboard-embed-sample">
                Dash Board 
              </a>
            </div> 
  
    
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
  
          <div className="text_field"> NickName :
            <span className="input_field">
            <TextField value={this.state.username} onChange={e => this.setState({username : e.target.value})}/> 
            </span>
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
      const _enemy = () => (this.checkEnemy);
      //this.checkEnemy;

      return (
        <header>
          <ReactHowler
                  src='https://s3.us-west-2.amazonaws.com/secure.notion-static.com/81396e40-15ea-4d1d-ae6f-7ee392314b3f/Ehrling_-_Lounge.wav?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAT73L2G45O3KS52Y5%2F20210521%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210521T230814Z&X-Amz-Expires=86400&X-Amz-Signature=b511ed1b33f00d0196b414f04cb55ade1d6881c785022b5aefbf84c77a419669&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Ehrling_-_Lounge.wav%22'
                  playing={true}
                  loop={true}
                  volume={0.3}
              />
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
              <span className="player-container" style={{paddingLeft: String(this.state.player1_x/10.0)+"%"}}>
                <img src="./resource/images/running.png" alt="" className="runner_img" 
                  style={{backgroundColor: this.state.skill_1_background_color}}
                  onClick={() => this.spell_on_player(1)}></img>
              </span>
            </div>
            
            <div className="track_line"></div>
            <div className="track">
              <span className="player-container" style={{paddingLeft: String(this.state.player2_x/10.0)+"%"}}>
                <img src="./resource/images/running.png" alt="" className="runner_img" 
                  style={{backgroundColor: this.state.skill_2_background_color}}
                  onClick={() => this.spell_on_player(2)}></img>
              </span>
            </div>
            
            <div className="track_line"></div>
            <div className="track">
              <span className="player-container" style={{paddingLeft: String(this.state.player3_x/10.0)+"%"}}>
                <img src="./resource/images/running.png" alt="" className="runner_img" 
                  style={{backgroundColor: this.state.skill_3_background_color}}
                  onClick={() => this.spell_on_player(3)}></img>
              </span>
            </div>

            <div className="track_line"></div>
            <div className="track">
              <span className="player-container" style={{paddingLeft: String(this.state.player4_x/10.0)+"%"}}>
                <img src="./resource/images/running.png" alt="" className="runner_img" 
                  style={{backgroundColor: this.state.skill_4_background_color}}
                  onClick={() => this.spell_on_player(4)}></img>
              </span>
            </div>
            <div className="track_line"></div>

            <div className="track_info_line"></div>
            <div className="track_info_line"></div>
          </div>

          <div className="container">
              <div className="item">{rank[0]}</div>
              <div className="item">{rank[1]}</div>
              <div className="item">{rank[2]}</div>
              <div className="item">{rank[3]}</div>

              <div className="item">{this.state.player1_id}</div>
              <div className="item">{this.state.player2_id}</div>
              <div className="item">{this.state.player3_id}</div>
              <div className="item">{this.state.player4_id}</div>
              
              <div className="item">{Enemy1}</div>
              <div className="item">Player is on {this.state.player1_x}</div>
              <div className="item">{Enemy2}</div>
              <div className="item">Player is on {this.state.player2_x}</div>
              <div className="item">{Enemy3}</div>
              <div className="item">Player is on {this.state.player3_x}</div>
              <div className="item">{Enemy4}</div>
              <div className="item">Player is on {this.state.player4_x}</div>
              
              <div className="item" onClick={()=> this.moveChatacter()}>MOVE!!!!!!</div>            
        
              <div className="item" onClick={()=>this.changeTogggle(1)}>
                <Tippy content={this.skillInfo(this.state.skill_name_1)}>
                  <span font-size><img src={this.state.skill_name_1_resource}/></span>
                </Tippy>
              </div>
              <div className="item" onClick={()=>this.changeTogggle(2)}>
                <Tippy content={this.skillInfo(this.state.skill_name_2)}>
                  <span font-size><img src={this.state.skill_name_2_resource}/></span>
                </Tippy>
              </div>
              <div className="item" onClick={()=>this.changeTogggle(3)}>
                <Tippy content={this.skillInfo(this.state.skill_name_3)}>
                  <span font-size><img src={this.state.skill_name_3_resource}/></span>
                </Tippy>
              </div>
              <div className="item" onClick={()=>this.changeTogggle(4)}>
               <Tippy content={this.skillInfo(this.state.skill_name_4)}>
                  <span font-size><img src={this.state.skill_name_4_resource}/></span>
                </Tippy>
              </div>
          </div>

        </header>

        
        
 
      );
    }
    else if (this.state.client_state === "endgame"){
      if (this.state.isWinng){
        return (
          <div className="IsWin">
            <h1>Game Ended</h1>
            <h2>You Win!</h2>
            <img src="./resource/images/flower.gif"></img>
          </div>
        );
      }

      else{
        return (
          <div className="IsWin">
            <h1>Game Ended</h1>
            <h2>You Lose!</h2>
            <img src="./resource/images/neckslice.png" ></img>
          </div>
        );
      }
      
    }
  }
}

export default withAuthenticator(App);
