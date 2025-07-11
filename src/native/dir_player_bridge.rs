//! DirPlayer Rust 核心逻辑 - Neon 桥接模块
//! 
//! 提供 JavaScript 与 Rust 之间的桥接接口，支持视频播放、分块管理等功能

use neon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// 视频分块数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MovieChunk {
    pub id: String,
    pub start_time: f64,
    pub duration: f64,
    pub url: String,
    pub metadata: HashMap<String, String>,
}

/// 视频分块列表配置
#[derive(Debug, Deserialize)]
pub struct MovieChunkConfig {
    pub video_id: String,
    pub chunk_policy: String, // "linear", "adaptive", "emotion_driven"
    pub total_duration: Option<f64>,
    pub chunk_size: Option<f64>,
    pub quality: Option<String>,
}

/// 全局状态管理
lazy_static::lazy_static! {
    static ref CHUNK_LISTS: Arc<Mutex<HashMap<String, Vec<MovieChunk>>>> = 
        Arc::new(Mutex::new(HashMap::new()));
    
    static ref PLAYER_STATE: Arc<Mutex<PlayerState>> = 
        Arc::new(Mutex::new(PlayerState::default()));
}

/// 播放器状态
#[derive(Debug, Default)]
pub struct PlayerState {
    pub current_video_id: Option<String>,
    pub current_chunk_index: usize,
    pub is_playing: bool,
    pub playback_speed: f64,
}

/// 创建视频分块列表
/// 
/// # Arguments
/// * `config_js` - JavaScript 传入的配置对象
/// 
/// # Returns
/// * `JsResult<JsArray>` - 返回分块列表的 JavaScript 数组
#[neon::function]
pub fn create_movie_chunk_list(mut cx: FunctionContext) -> JsResult<JsArray> {
    // 获取配置参数
    let config_obj = cx.argument::<JsObject>(0)?;
    
    // 解析 video_id
    let video_id = config_obj
        .get::<JsString, _, _>(&mut cx, "videoId")?
        .value(&mut cx);
    
    // 解析 chunk_policy
    let chunk_policy = config_obj
        .get::<JsString, _, _>(&mut cx, "chunkPolicy")?
        .value(&mut cx);
    
    // 解析可选参数
    let total_duration = config_obj
        .get_opt::<JsNumber, _, _>(&mut cx, "totalDuration")?
        .map(|n| n.value(&mut cx))
        .unwrap_or(60.0); // 默认60秒
    
    let chunk_size = config_obj
        .get_opt::<JsNumber, _, _>(&mut cx, "chunkSize")?
        .map(|n| n.value(&mut cx))
        .unwrap_or(5.0); // 默认5秒一段
    
    // 生成分块列表
    let chunks = generate_chunks(&video_id, &chunk_policy, total_duration, chunk_size);
    
    // 存储到全局状态
    {
        let mut chunk_lists = CHUNK_LISTS.lock().unwrap();
        chunk_lists.insert(video_id.clone(), chunks.clone());
    }
    
    // 转换为 JavaScript 数组
    let js_array = JsArray::new(&mut cx, chunks.len() as u32);
    
    for (i, chunk) in chunks.iter().enumerate() {
        let chunk_obj = JsObject::new(&mut cx);
        
        let id = cx.string(&chunk.id);
        chunk_obj.set(&mut cx, "id", id)?;
        
        let start_time = cx.number(chunk.start_time);
        chunk_obj.set(&mut cx, "startTime", start_time)?;
        
        let duration = cx.number(chunk.duration);
        chunk_obj.set(&mut cx, "duration", duration)?;
        
        let url = cx.string(&chunk.url);
        chunk_obj.set(&mut cx, "url", url)?;
        
        // 添加元数据
        let metadata_obj = JsObject::new(&mut cx);
        for (key, value) in &chunk.metadata {
            let js_key = cx.string(key);
            let js_value = cx.string(value);
            metadata_obj.set(&mut cx, js_key, js_value)?;
        }
        chunk_obj.set(&mut cx, "metadata", metadata_obj)?;
        
        js_array.set(&mut cx, i as u32, chunk_obj)?;
    }
    
    // 输出日志
    println!("🎬 [DirPlayer] 创建视频分块列表: {} | 策略: {} | 分块数: {}", 
             video_id, chunk_policy, chunks.len());
    
    Ok(js_array)
}

/// 处理视频分块列表变化事件
/// 
/// # Arguments
/// * `data_js` - JavaScript 传入的事件数据
/// 
/// # Returns
/// * `JsResult<JsUndefined>` - 无返回值
#[neon::function]
pub fn on_movie_chunk_list_changed(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let data_obj = cx.argument::<JsObject>(0)?;
    
    // 解析事件数据
    let video_id = data_obj
        .get::<JsString, _, _>(&mut cx, "videoId")?
        .value(&mut cx);
    
    let event_type = data_obj
        .get::<JsString, _, _>(&mut cx, "eventType")?
        .value(&mut cx);
    
    let chunk_index = data_obj
        .get_opt::<JsNumber, _, _>(&mut cx, "chunkIndex")?
        .map(|n| n.value(&mut cx) as usize)
        .unwrap_or(0);
    
    // 更新播放器状态
    {
        let mut state = PLAYER_STATE.lock().unwrap();
        
        match event_type.as_str() {
            "chunk_started" => {
                state.current_video_id = Some(video_id.clone());
                state.current_chunk_index = chunk_index;
                state.is_playing = true;
                println!("▶️ [DirPlayer] 分块开始播放: {} - 分块 {}", video_id, chunk_index);
            }
            "chunk_ended" => {
                state.current_chunk_index = chunk_index + 1;
                println!("⏭️ [DirPlayer] 分块播放结束: {} - 分块 {}", video_id, chunk_index);
            }
            "playback_paused" => {
                state.is_playing = false;
                println!("⏸️ [DirPlayer] 播放暂停: {}", video_id);
            }
            "playback_resumed" => {
                state.is_playing = true;
                println!("▶️ [DirPlayer] 播放恢复: {}", video_id);
            }
            "playback_completed" => {
                state.is_playing = false;
                state.current_chunk_index = 0;
                println!("✅ [DirPlayer] 播放完成: {}", video_id);
            }
            _ => {
                println!("⚠️ [DirPlayer] 未知事件类型: {}", event_type);
            }
        }
    }
    
    // 触发相关的回调处理
    handle_chunk_event(&video_id, &event_type, chunk_index);
    
    Ok(cx.undefined())
}

/// 获取当前播放状态
#[neon::function]
pub fn get_player_state(mut cx: FunctionContext) -> JsResult<JsObject> {
    let state = PLAYER_STATE.lock().unwrap();
    let state_obj = JsObject::new(&mut cx);
    
    if let Some(ref video_id) = state.current_video_id {
        let js_video_id = cx.string(video_id);
        state_obj.set(&mut cx, "currentVideoId", js_video_id)?;
    } else {
        state_obj.set(&mut cx, "currentVideoId", cx.null())?;
    }
    
    let chunk_index = cx.number(state.current_chunk_index as f64);
    state_obj.set(&mut cx, "currentChunkIndex", chunk_index)?;
    
    let is_playing = cx.boolean(state.is_playing);
    state_obj.set(&mut cx, "isPlaying", is_playing)?;
    
    let playback_speed = cx.number(state.playback_speed);
    state_obj.set(&mut cx, "playbackSpeed", playback_speed)?;
    
    Ok(state_obj)
}

/// 设置播放速度
#[neon::function]
pub fn set_playback_speed(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let speed = cx.argument::<JsNumber>(0)?.value(&mut cx);
    
    {
        let mut state = PLAYER_STATE.lock().unwrap();
        state.playback_speed = speed;
    }
    
    println!("🚀 [DirPlayer] 设置播放速度: {}x", speed);
    
    Ok(cx.undefined())
}

/// 生成视频分块
fn generate_chunks(
    video_id: &str, 
    chunk_policy: &str, 
    total_duration: f64, 
    chunk_size: f64
) -> Vec<MovieChunk> {
    let mut chunks = Vec::new();
    let chunk_count = (total_duration / chunk_size).ceil() as usize;
    
    for i in 0..chunk_count {
        let start_time = i as f64 * chunk_size;
        let duration = if i == chunk_count - 1 {
            total_duration - start_time // 最后一块可能不足 chunk_size
        } else {
            chunk_size
        };
        
        let chunk_id = format!("{}_chunk_{:03}", video_id, i);
        let chunk_url = generate_chunk_url(video_id, i, chunk_policy);
        
        let mut metadata = HashMap::new();
        metadata.insert("policy".to_string(), chunk_policy.to_string());
        metadata.insert("index".to_string(), i.to_string());
        metadata.insert("total_chunks".to_string(), chunk_count.to_string());
        
        // 根据策略添加额外元数据
        match chunk_policy {
            "emotion_driven" => {
                metadata.insert("emotion_hint".to_string(), get_emotion_hint_for_chunk(i));
            }
            "adaptive" => {
                metadata.insert("quality_level".to_string(), get_adaptive_quality(i));
            }
            _ => {} // linear 策略不需要额外元数据
        }
        
        chunks.push(MovieChunk {
            id: chunk_id,
            start_time,
            duration,
            url: chunk_url,
            metadata,
        });
    }
    
    chunks
}

/// 生成分块 URL
fn generate_chunk_url(video_id: &str, chunk_index: usize, policy: &str) -> String {
    match policy {
        "linear" => format!("/videos/{}/chunks/{:03}.mp4", video_id, chunk_index),
        "adaptive" => format!("/videos/{}/adaptive/chunk_{:03}_auto.mp4", video_id, chunk_index),
        "emotion_driven" => format!("/videos/{}/emotion/chunk_{:03}_emo.mp4", video_id, chunk_index),
        _ => format!("/videos/{}/default/chunk_{:03}.mp4", video_id, chunk_index),
    }
}

/// 获取情绪提示
fn get_emotion_hint_for_chunk(chunk_index: usize) -> String {
    match chunk_index % 4 {
        0 => "calm".to_string(),
        1 => "curious".to_string(),
        2 => "excited".to_string(),
        3 => "happy".to_string(),
        _ => "neutral".to_string(),
    }
}

/// 获取自适应质量
fn get_adaptive_quality(chunk_index: usize) -> String {
    match chunk_index % 3 {
        0 => "720p".to_string(),
        1 => "1080p".to_string(),
        2 => "4k".to_string(),
        _ => "auto".to_string(),
    }
}

/// 处理分块事件
fn handle_chunk_event(video_id: &str, event_type: &str, chunk_index: usize) {
    // 这里可以添加更复杂的事件处理逻辑
    // 例如：触发回调、更新UI、发送统计数据等
    
    match event_type {
        "chunk_started" => {
            // 可以在这里触发行为调度器的相关事件
            println!("🎬 [Event] 分块开始事件处理: {}", video_id);
        }
        "chunk_ended" => {
            // 可以在这里预加载下一分块
            println!("🔄 [Event] 分块结束事件处理，预加载下一分块");
        }
        "playback_completed" => {
            // 播放完成后的清理工作
            println!("🏁 [Event] 播放完成事件处理");
        }
        _ => {}
    }
}

/// 注册 Neon 模块
register_module!(mut cx, {
    cx.export_function("createMovieChunkList", create_movie_chunk_list)?;
    cx.export_function("onMovieChunkListChanged", on_movie_chunk_list_changed)?;
    cx.export_function("getPlayerState", get_player_state)?;
    cx.export_function("setPlaybackSpeed", set_playback_speed)?;
    Ok(())
});
