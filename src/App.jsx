// basic react system
import React, { Component}  from 'react';
import './App.css';

// AWS 
import Amplify, {API, graphqlOperation}from 'aws-amplify';
import awsconfig from './aws-exports';
import {AmplifySignOut, withAuthenticator} from '@aws-amplify/ui-react';

// AWS APIs
import {listMMRs, listSessionWaitings, listSessionMatchings, listOnGameSessions, listOnGameSkills} from './graphql/queries'
import {createMMR, createSessionWaiting, deleteSessionWaiting, createSessionMatching, deleteSessionMatching, createOnGameSession, updateOnGameSession, deleteOnGameSession, createOnGameSkill, updateOnGameSkill} from './graphql/mutations'

//uuid
import {v4 as uuid} from 'uuid'

//UIs
import { TextField } from '@material-ui/core';

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

    this.setState({player1_x : parseInt(my_game.player1_x)});
    this.setState({player2_x : parseInt(my_game.player2_x)});
    this.setState({player3_x : parseInt(my_game.player3_x)});
    this.setState({player4_x : parseInt(my_game.player4_x)});


    //skill sync 
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

  async moveChatacter(){
    await this.loadGameData();
    
    if (this.state.my_number == 1){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)


      my_game.player1_x = this.state.player1_x + this.state.gameSetting[0].speed;


      delete my_game.createdAt;
      delete my_game.updatedAt;


      const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

      this.setState({player1_x : parseInt(my_game.player1_x)});
    }

    else if (this.state.my_number == 2){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)


      my_game.player2_x = this.state.player2_x + this.state.gameSetting[0].speed;


      delete my_game.createdAt;
      delete my_game.updatedAt;


      const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

      this.setState({player2_x : parseInt(my_game.player2_x)});
    }

    else if (this.state.my_number == 3){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)


      my_game.player3_x = this.state.player3_x + this.state.gameSetting[0].speed;


      delete my_game.createdAt;
      delete my_game.updatedAt;


      const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

      this.setState({player3_x : parseInt(my_game.player3_x)});
      
    }

    else if (this.state.my_number == 4){

      const OnGameSessionsList = await API.graphql(graphqlOperation(listOnGameSessions))
      let OnGameSessionsListItems =  OnGameSessionsList.data.listOnGameSessions.items;

      const my_game= OnGameSessionsListItems.find(OnGameSessionsListItem => OnGameSessionsListItem.id === this.state.gameid)


      my_game.player4_x = this.state.player4_x + this.state.gameSetting[0].speed;


      delete my_game.createdAt;
      delete my_game.updatedAt;


      const updated_game = await API.graphql(graphqlOperation(updateOnGameSession, {input:my_game}))

      this.setState({player4_x : parseInt(my_game.player4_x)});
      
    }

    this.checkGetSkill()

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

  checkGetSkill(){
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



  render(){
    var Enemy1 = "Enemy";
    var Enemy2 = "Enemy";
    var Enemy3 = "Enemy";
    var Enemy4 = "Enemy";

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
      const _enemy = () => (this.checkEnemy);
      //this.checkEnemy;

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
              <div className="item">1.</div>
              <div className="item">2.</div>
              <div className="item">3.</div>
              <div className="item">4.</div>

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
        
              <div className="item" onClick={()=>this.changeTogggle(1)}><span font-size><img src={this.state.skill_name_1_resource}/></span></div>
              <div className="item" onClick={()=>this.changeTogggle(2)}><span font-size><img src={this.state.skill_name_2_resource}/></span></div>
              <div className="item" onClick={()=>this.changeTogggle(3)}><span font-size><img src={this.state.skill_name_3_resource}/></span></div>
              <div className="item" onClick={()=>this.changeTogggle(4)}><span font-size><img src={this.state.skill_name_4_resource}/></span></div>
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