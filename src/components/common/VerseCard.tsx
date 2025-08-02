import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Verse } from '../../types';

interface VerseCardProps {
  readonly verse: Verse;
  readonly showSanskrit?: boolean;
  readonly showTransliteration?: boolean;
  readonly showTranslation?: boolean;
  readonly showCommentary?: boolean;
  readonly onAudioPress?: () => void;
  readonly onFavoritePress?: () => void;
  readonly onStudyPress?: () => void;
  readonly isFavorite?: boolean;
  readonly compact?: boolean;
  readonly showActions?: boolean;
  readonly onPress?: () => void;
}

export default function VerseCard({
  verse,
  showSanskrit = true,
  showTransliteration = true,
  showTranslation = true,
  showCommentary = false,
  onAudioPress,
  onFavoritePress,
  onStudyPress,
  isFavorite = false,
  compact = false,
  showActions = true,
  onPress,
}: VerseCardProps) {
  const formatVerseReference = () => `${verse.capitulo}.${verse.verso}`;

  const cardContent = (
    <View style={[styles.container, compact && styles.compactContainer]}>
      {/* Header con referencia y acciones */}
      <View style={styles.header}>
        <View style={styles.referenceContainer}>
          <Text style={styles.referenceText}>
            Bhagavad Gītā {formatVerseReference()}
          </Text>
        </View>
        
        {showActions && (
          <View style={styles.actionsContainer}>
            {onAudioPress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onAudioPress}
              >
                <Ionicons name="volume-high" size={20} color="#FF9933" />
              </TouchableOpacity>
            )}
            
            {onFavoritePress && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onFavoritePress}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color={isFavorite ? "#FF6B6B" : "#666"} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Contenido del verso */}
      <View style={styles.content}>
        {/* Sánscrito */}
        {showSanskrit && !!verse.sanskrit && (
          <View style={styles.textSection}>
            <Text style={styles.sanskrit}>{verse.sanskrit}</Text>
          </View>
        )}

        {/* Transliteración */}
        {showTransliteration && !!verse.transliteracion && (
          <View style={styles.textSection}>
            <Text style={styles.transliteration}>{verse.transliteracion}</Text>
          </View>
        )}

        {/* Traducción */}
        {showTranslation && (
          <View style={styles.textSection}>
            <Text style={styles.translation}>{verse.traduccion}</Text>
          </View>
        )}

        {/* Comentario */}
        {showCommentary && !!verse.comentario && (
          <View style={[styles.textSection, styles.commentarySection]}>
            <Text style={styles.commentaryTitle}>💭 Comentario:</Text>
            <Text style={styles.commentary}>{verse.comentario}</Text>
          </View>
        )}
      </View>

      {/* Botón de estudio */}
      {showActions && onStudyPress && (
        <TouchableOpacity
          style={styles.studyButton}
          onPress={onStudyPress}
        >
          <Ionicons name="school" size={20} color="white" />
          <Text style={styles.studyButtonText}>Estudiar este verso</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    padding: 15,
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  referenceContainer: {
    flex: 1,
  },
  referenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9933',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  content: {
    marginBottom: 15,
  },
  textSection: {
    marginBottom: 12,
  },
  sanskrit: {
    fontSize: 20,
    fontFamily: 'System', // En producción usar Noto Sans Devanagari
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
  },
  transliteration: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  translation: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentarySection: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9933',
  },
  commentaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9933',
    marginBottom: 8,
  },
  commentary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  studyButton: {
    backgroundColor: '#FF9933',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
