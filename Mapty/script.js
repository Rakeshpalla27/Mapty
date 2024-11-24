'use strict';

// prettier-ignore

class Workout{
    date =new Date();
    id=(Date.now()+'').slice(-10);
    constructor(coords,distance,duration){
        this.coords=coords;
        this.distance=distance;
        this.duration=duration;
    }

    _setdescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];

    this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on 
    ${months[this.date.getMonth()]} ${this.date.getDate()} `;


    }
}

class Running extends Workout{
    type='running';
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration);
        this.cadence=cadence;
        this.calpace();
        this._setdescription();

       

    }

    calpace(){
        //   =>min/km
        this.pace=this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends Workout{
    type='cycling';
    constructor(coords,distance,duration,elevationgain){
        super(coords,distance,duration);
        this.elevationgain=elevationgain;
        this.calspeed();
        this._setdescription();

    }
    
    calspeed(){
        // km/hr
        this.speed=this.distance/(this.duration/60);
        return this.speed;
    }
}

//object for running and cycling for test

// const running1=new Running([34,32],5.2,23,244);
// const cycling1=new Cycling([37,-32],7,83,789);
// console.log(running1,cycling1);




// applicaiton architecture 

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App{
    #map;
    #mapEvent;
    #workouts=[];
    #zoomlevel=13;

    constructor(){
        //getting position
        this._getposition();

        //get data from local storage
        this._getlocalstorage();

        //eventhandlers
        form.addEventListener('submit',this._newworkout.bind(this));
        inputType.addEventListener('change',this._toggleelevationfield);
        containerWorkouts.addEventListener('click',this._movetopopup.bind(this));
        
    }

    _getposition(){
        navigator.geolocation.getCurrentPosition(this._loadmap.bind(this),function(){
            alert("couldnt able to find your position");
        })
    };

    _loadmap(position){
        
            // console.log(position);
            const {latitude}=position.coords;
            const {longitude}=position.coords;
            // console.log(latitude,longitude);
            // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
            
            const coords=[latitude,longitude];
            // console.log(this);

            this.#map = L.map('map').setView(coords,this.#zoomlevel);
            // console.log(this.#map);
        
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);
        
            this.#map.on('click',this._showform.bind(this));

            this.#workouts.forEach(work=>{
                this._renderworkoutmarker(work);
            });

    };

    _showform(mape){
        this.#mapEvent=mape;
        //handling clicks on maps
        form.classList.remove('hidden');
        inputDistance.focus();
    };

    _hideform(){
        inputDistance.value=inputCadence.value=inputDuration.value=inputElevation.value=" ";
        form.style.display='none';
        form.classList.add('hidden');
        setTimeout(() => {
            form.style.display='grid'
        }, 1000);
    }

    _toggleelevationfield(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    
    };

    _newworkout(e){
        e.preventDefault();

        const validinputs=(...inputs)=>
            inputs.every(inp=>Number.isFinite(inp));

        const allpositive=(...inputs)=>
            inputs.every(inp=>inp>0);

        //getting data from form
        const type=inputType.value;
        const distance=+inputDistance.value;
        const duration=+inputDuration.value;
        const {lat,lng}=this.#mapEvent.latlng;
        let workout;
 
        //If workout running ,create Running object 
        if(type==='running'){
            const cadence=+inputCadence.value;
            // checking data is valid or not 
            //used code refactoring using validinputs method
            // if(!Number.isFinite(distance) ||
            // !Number.isFinite(duration) ||
            //  !Number.isFinite(cadence)) 
            if(!validinputs(duration,distance,cadence) ||
               !allpositive(duration,distance,cadence)){
                return alert('Inputs have to be positive numbers!');
            }

            workout=new Running([lat,lng],distance,duration,cadence);
            console.log(workout);
        }


        //If workout cycling ,create Cycling object 
        if(type==='cycling'){ 
            const elevation=+inputElevation.value;
            //checking valid inputs
            if(!validinputs(duration,distance,elevation) ||
            !allpositive(duration,distance)){
                return alert('Inputs have to be positive numbers!');
            }

            workout=new Cycling([lat,lng],distance,duration,elevation);
            console.log(workout);

        }

        //add workout to the array
        this.#workouts.push(workout)

        //render workout on map as marker
        this._renderworkoutmarker(workout);
    
        

        //render workout on list
        this._renderworkout(workout);


        //hidding form and clear inputfields
        this._hideform();

        //storing in local storage
        this._setlocalstorage();
        
    };

    _renderworkoutmarker(workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:250,
            minWidht:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`   
        }))
        .setPopupContent(`${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'} ${workout.description}`)
        .openPopup();

    }

    _renderworkout(workout){
        let html=`
         <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type==='running'?'🏃‍♂️':'🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;
        if(workout.type==='running'){
            html+=`<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        }
        if(workout.type==='cycling'){
            html+=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationgain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> `;
        }

    form.insertAdjacentHTML('afterend',html);
    }

    _movetopopup(e){
        const workoutel=e.target.closest('.workout');
        // console.log(workoutel);
        if(!workoutel) return ;

        const workout=this.#workouts.find(
            work=>work.id===workoutel.dataset.id)

        this.#map.setView(workout.coords,this.#zoomlevel,{
            animate:true,
            pan:{
                duration:1,
            },
    
        });
    }

    _setlocalstorage(){
        localStorage.setItem('workouts',JSON.stringify(this.#workouts));
    }

    _getlocalstorage(){
       const data=JSON.parse(localStorage.getItem('workouts'));
       if(!data) return;
       this.#workouts=data;

       this.#workouts.forEach(work=>{
        this._renderworkout(work)

    });
    };
    reset(){
        //through object we can run this method it is a public method
        localStorage.removeItem('workouts');
        location.reload();
    }

}



const app=new App();








