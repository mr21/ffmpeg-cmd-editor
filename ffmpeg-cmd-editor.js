"use strict";

const {
	useRef,
	useState,
	useEffect,
	useCallback,
	createElement: cE,
} = React;

function FFCE() {
	const vidRef = useRef();
	const currentTimeRef = useRef();
	const currentTimeTextRef = useRef();

	const storeRef = useRef( {
		animId: null,
	} ).current;

	// .........................................................................
	const [ ctrlMute, setCtrlMute ] = useState( false );
	const [ ctrlVolume, setCtrlVolume ] = useState( 1 );
	const [ ctrlDuration, setCtrlDuration ] = useState( 0 );

	const [ src, setSrc ] = useState( '' );
	const [ inputName, setInputName ] = useState( '' );
	const [ outputName, setOutputName ] = useState( '' );
	const [ mute, setMute ] = useState( false );
	const [ flipH, setFlipH ] = useState( false );
	const [ flipV, setFlipV ] = useState( false );
	const [ rotateOn, setRotateOn ] = useState();
	const [ rotate, setRotate ] = useState();
	const [ trimAOn, setTrimAOn ] = useState( false );
	const [ trimAStr, setTrimAStr ] = useState( '' );
	const [ trimASec, setTrimASec ] = useState( 0 );
	const [ trimBOn, setTrimBOn ] = useState( false );
	const [ trimBType, setTrimBType ] = useState();
	const [ trimBTimeStr, setTrimBTimeStr ] = useState( '' );
	const [ trimBTimeSec, setTrimBTimeSec ] = useState( 0 );
	const [ trimBDurationStr, setTrimBDurationStr ] = useState( '' );
	const [ trimBDurationSec, setTrimBDurationSec ] = useState( 0 );

	// .........................................................................
	const onClear = useCallback( e => {
		cancelAnimationFrame( storeRef.animId );
		setSrc( '' );
		setInputName( '<input-file>' );
		setOutputName( '<output-file>' );
		setCtrlDuration( 0 );
		setMute( false );
		setFlipH( false );
		setFlipV( false );
		setRotateOn( false );
		setRotate( 90 );
		setTrimAOn( false );
		setTrimAStr( '00:00:00' );
		setTrimASec( 0 );
		setTrimBOn( false );
		setTrimBType( 'time' );
		setTrimBTimeStr( '00:00:00' );
		setTrimBTimeSec( 0 );
		setTrimBDurationStr( '00:00:00' );
		setTrimBDurationSec( 0 );
		currentTimeTextRef.current.textContent = FFCE_durToStr( 0 );
	}, [] );

	const frame = useCallback( () => {
		const time = vidRef.current?.currentTime || 0;

		currentTimeRef.current.value = time;
		currentTimeTextRef.current.textContent = FFCE_durToStr( time );
		storeRef.animId = requestAnimationFrame( frame );
	}, [] );
	const onLoadedMetadata = useCallback( e => {
		setCtrlDuration( e.target.duration );
	}, [] );
	const onClickPlay = useCallback( () => {
		if ( vidRef.current.readyState > 0 ) {
			if ( vidRef.current.paused ) {
				frame();
				vidRef.current.play()
			} else {
				cancelAnimationFrame( storeRef.animId );
				vidRef.current.pause();
			}
		}
	}, [] );
	const onClickMute = useCallback( () => {
		if ( ctrlVolume > 0 ) {
			setCtrlMute( b => !b );
		} else {
			setCtrlVolume( 1 );
			setCtrlMute( false );
		}
	}, [ ctrlVolume ] );
	const onChangeVolume = useCallback( e => {
		setCtrlMute( false );
		setCtrlVolume( +e.target.value );
	}, [] );
	const onChangeCurrentTime = useCallback( e => {
		const time = +e.target.value;

		vidRef.current.currentTime = time;
		currentTimeTextRef.current.textContent = FFCE_durToStr( time );
	}, [] );

	// .........................................................................
	const onToggleFlipH = useCallback( () => setFlipH( b => !b ), [] );
	const onToggleFlipV = useCallback( () => setFlipV( b => !b ), [] );
	const onToggleRotate = useCallback( () => setRotateOn( b => !b ), [] );
	const onChangeRotate = useCallback( e => setRotate( +e.target.value ), [] );
	const onToggleMute = useCallback( () => setMute( b => !b ), [] );
	const onToggleTrimA = useCallback( () => setTrimAOn( b => !b ), [] );
	const onToggleTrimB = useCallback( () => setTrimBOn( b => !b ), [] );
	const onChangeTrimBType = useCallback( e => setTrimBType( e.target.value ), [] );

	// .........................................................................
	const onDragOver = useCallback( e => e.preventDefault(), [] );
	const onDrop = useCallback( e => {
		const vid = e.dataTransfer.files[ 0 ];
		const nameArr = vid.name.split( '.' );
		const ext = nameArr.pop();
		const name = nameArr.join( '.' );

		e.preventDefault();
		setSrc( URL.createObjectURL( vid ) );
		setInputName( `${ name }.${ ext }` );
		setOutputName( `${ name }-output.${ ext }` );
	}, [] );

	// .........................................................................
	const onChangeTrimA = useCallback( e => {
		setTrimAStr( e.target.value );
		if ( e.target.checkValidity() ) {
			setTrimASec( FFCE_strToDur( e.target.value ) );
		}
	}, [] );
	const onChangeTrimBTime = useCallback( e => {
		setTrimBTimeStr( e.target.value );
		if ( e.target.checkValidity() ) {
			setTrimBTimeSec( FFCE_strToDur( e.target.value ) );
		}
	}, [] );
	const onChangeTrimBDuration = useCallback( e => {
		setTrimBDurationStr( e.target.value );
		if ( e.target.checkValidity() ) {
			setTrimBDurationSec( FFCE_strToDur( e.target.value ) );
		}
	}, [] );
	const onPickTrimA = useCallback( () => {
		const sec = Math.floor( vidRef.current.currentTime );

		setTrimASec( sec );
		setTrimAStr( FFCE_durToStr( sec ) );
	}, [] );
	const onPickTrimB = useCallback( () => {
		const sec = Math.floor( vidRef.current.currentTime );

		setTrimBTimeSec( sec );
		setTrimBTimeStr( FFCE_durToStr( sec ) );
	}, [] );

	// .........................................................................
	useEffect(() => { if ( vidRef.current ) { vidRef.current.muted = ctrlMute; } }, [ ctrlMute ]);
	useEffect(() => { if ( vidRef.current ) { vidRef.current.volume = ctrlVolume; } }, [ ctrlVolume ]);

	useEffect(() => {
		onClear();
	}, []);

	// .........................................................................
	const rotateCustom = rotate !== 90 && rotate !== 180 && rotate !== 270;

	const cmdTrimA = !trimAOn ? '' : ` -ss ${ trimAStr }`;
	const cmdTrimB = !trimBOn ? '' :
		trimBType === 'time'
			? ` -to ${ trimBTimeStr }`
			: ` -t ${ trimBDurationStr }`;
	const cmdMute = mute ? ' -an' : '';
	const cmdFiltersArr = [];
	if ( flipH ) { cmdFiltersArr.push( 'hflip' ); }
	if ( flipV ) { cmdFiltersArr.push( 'vflip' ); }
	if ( rotateOn ) {
		switch ( rotate ) {
			case  90: cmdFiltersArr.push( 'transpose=1' ); break;
			case 180: cmdFiltersArr.push( 'transpose=1,transpose=1' ); break;
			case 270: cmdFiltersArr.push( 'transpose=2' ); break;
			default: cmdFiltersArr.push( `rotate=${ ( rotate * Math.PI / 180 ).toFixed( 2 ) }` ); break;
			// rotate='2*PI*t:ow=hypot(iw,ih):oh=ow'
		}
	}
	const cmdFilters = cmdFiltersArr.length ? ` -vf ${ cmdFiltersArr }` : '';
	const cmdCopy = cmdFiltersArr.length ? ' -c:a copy' : ' -c copy';
	const cmd = `ffmpeg${ cmdTrimA }${ cmdTrimB } -i "${ inputName }"${ cmdFilters }${ cmdCopy }${ cmdMute } "${ outputName }"`;

	// .........................................................................
	return cE( 'div', { id: 'app', onDragOver, onDrop },
		cE( 'div', { id: 'app-top' },
			cE( 'div', {
				id: 'video-wrap',
				'data-hflip': flipH ? '' : null,
				'data-vflip': flipV ? '' : null,
			},
				cE( 'div', { style: { transform: rotateOn ? `rotate(${ rotate }deg)` : 'none' } },
					cE( 'video', { src, ref: vidRef, onLoadedMetadata } ),
				),
			),
		),
		cE( 'div', { id: 'app-bottom' },
			cE( 'div', { id: 'ctrls' },
				cE( 'button', { onClick: onClickPlay, type: 'button' },
					cE( 'i', { 'data-icon': 'play' } ),
					cE( 'span', null, ' / ' ),
					cE( 'i', { 'data-icon': 'pause' } ),
				),
				cE( 'button', { id: 'ctrls-mute', onClick: onClickMute, type: 'button' },
					cE( 'i', { 'data-icon': ctrlVolume && !ctrlMute ? 'volume-up' : 'volume-slash' } ),
				),
				cE( 'input', { id: 'ctrl-volume', type: 'range', min: 0, max: 1, step: .01, value: ctrlMute ? 0 : ctrlVolume, onChange: onChangeVolume } ),
				cE( 'span', { id: 'ctrl-currentTimeText', ref: currentTimeTextRef } ),
				cE( 'span', null, FFCE_durToStr( ctrlDuration ) ),
				cE( 'input', {
					id: 'ctrl-currentTime',
					type: 'range',
					min: 0,
					max: ctrlDuration,
					step: .01,
					onChange: onChangeCurrentTime,
					ref: currentTimeRef,
				} ),
			),
			cE( 'code', { id: 'cmd' }, cmd ),
			cE( 'div', { class: 'params' },
				cE( 'fieldset', { class: 'param' },
					cE( 'legend', null,
						cE( 'label', null,
							cE( 'i', { 'data-icon': 'arrow-to-right' } ),
							cE( 'span', null, 'trim start' ),
							cE( 'input', { type: 'checkbox', checked: trimAOn, onChange: onToggleTrimA } ),
						),
					),
					cE( 'input', { id: 'trimA-time', type: 'text', value: trimAStr, onChange: onChangeTrimA, required: true, pattern: '\\d\\d:\\d\\d:\\d\\d' } ),
					cE( 'button', { onClick: onPickTrimA, type: 'button' }, cE( 'i', { 'data-icon': 'pick' } ), cE( 'span', null, ' current time' ) ),
				),
				cE( 'fieldset', { class: 'param', id: 'trimB' },
					cE( 'legend', null,
						cE( 'label', null,
							cE( 'i', { 'data-icon': 'arrow-to-left' } ),
							cE( 'span', null, 'trim end' ),
							cE( 'input', { type: 'checkbox', checked: trimBOn, onChange: onToggleTrimB } ),
						),
					),
					cE( 'label', null,
						cE( 'input', { type: 'radio', name: 'trimB', value: 'time', disabled: !trimBOn, checked: trimBType === 'time', onChange: onChangeTrimBType } ),
						cE( 'span', null, 'by time' ),
						cE( 'input', { id: 'trimB-time', type: 'text', value: trimBTimeStr, onChange: onChangeTrimBTime, required: true, pattern: '\\d\\d:\\d\\d:\\d\\d' } ),
						cE( 'button', { onClick: onPickTrimB, type: 'button' }, cE( 'i', { 'data-icon': 'pick' } ), cE( 'span', null, ' current time' ) ),
					),
					cE( 'label', null,
						cE( 'input', { type: 'radio', name: 'trimB', value: 'duration', disabled: !trimBOn, checked: trimBType === 'duration', onChange: onChangeTrimBType } ),
						cE( 'span', null, 'by duration' ),
						cE( 'input', { id: 'trimB-time', type: 'text', value: trimBDurationStr, onChange: onChangeTrimBDuration, required: true, pattern: '\\d\\d:\\d\\d:\\d\\d' } ),
					),
				),
			),
			cE( 'div', { class: 'params' },
				cE( 'fieldset', { class: 'param', id: 'flip' },
					cE( 'legend', null,
						cE( 'span', null, 'flip' ),
					),
					cE( 'label', null,
						cE( 'input', { type: 'checkbox', checked: flipH, onChange: onToggleFlipH } ),
						cE( 'i', { 'data-icon': 'arrows-h' } ),
						cE( 'span', null, 'horizontally' ),
					),
					cE( 'label', null,
						cE( 'input', { type: 'checkbox', checked: flipV, onChange: onToggleFlipV } ),
						cE( 'i', { 'data-icon': 'arrows-v' } ),
						cE( 'span', null, 'vertically' ),
					),
				),
				cE( 'fieldset', { class: 'param' },
					cE( 'legend', null,
						cE( 'label', null,
							cE( 'i', { 'data-icon': 'redo' } ),
							cE( 'span', null, 'rotate' ),
							cE( 'input', { type: 'checkbox', checked: rotateOn, onChange: onToggleRotate } ),
						),
					),
					cE( 'input', { type: 'range', min: 0, max: 360, value: rotate, onChange: onChangeRotate, disabled: !rotateOn } ),
					cE( 'select', { value: rotate, onChange: onChangeRotate, disabled: !rotateOn },
						rotateCustom && cE( 'option', { value: rotate }, `custom ${ rotate }°` ),
						cE( 'option', { value:  90 },  '90°' ),
						cE( 'option', { value: 180 }, '180°' ),
						cE( 'option', { value: 270 }, '270°' ),
					),
				),
			),
			cE( 'div', { class: 'params' },
				cE( 'fieldset', { class: 'param' },
					cE( 'legend', null,
						cE( 'span', null, 'sound' ),
					),
					cE( 'label', null,
						cE( 'input', { type: 'checkbox', checked: mute, onChange: onToggleMute } ),
						cE( 'i', { 'data-icon': 'volume-slash' } ),
						cE( 'span', null, 'mute' ),
					),
				),
			),
			cE( 'div', { class: 'params' },
				cE( 'div', { class: 'param' },
					cE( 'button', { id: 'clear', onClick: onClear, type: 'button' }, 'clear' ),
				),
			),
		),
	);
}

function FFCE_strToDur( s ) {
	const [ hh, mm, ss ] = s.split( ":" );

	return hh * 3600 + mm * 60 + +ss;
}

function FFCE_durToStr( dur ) {
	const ss = dur % 60 | 0;
	const hh = dur / 3600 | 0;
	const mm = ( dur - ss - hh * 3600 ) / 60 | 0;

	return (
		hh.toString().padStart( 2, '0' ) + ':' +
		mm.toString().padStart( 2, '0' ) + ':' +
		ss.toString().padStart( 2, '0' )
	);
}
