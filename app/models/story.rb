class Story < ActiveRecord::Base
  belongs_to :group, :foreign_key => 'service_id'
  has_many :group_memberships
  has_many :groups, :through => :group_memberships
  belongs_to :replaces_story, :class_name => "Story"
  has_many :story_stages, :dependent => :destroy
  has_many :story_link_entrances, :class_name => "StoryLink", :foreign_key => "to_id", :dependent => :destroy
  has_many :story_link_exits, :class_name => "StoryLink", :foreign_key => "from_id", :dependent => :destroy
  has_many :parents, :through => :story_link_entrances, :source => 'from'
  has_many :children, :through => :story_link_exits, :source => 'to'

  scope :no_stages, -> { where("story_stages_count = 0") }

  has_paper_trail ignore: [:updated_at, :created_at, :id]

  def nodes
    nodes = []
    story_stages.each do |story_stage|
      nodes << story_stage.from
      nodes << story_stage.to
    end
    nodes.uniq    
  end

  def average_time
    story_stages.collect(&:average_time).compact.inject{|sum,x| sum + x }
  end

  def average_time_string
    ChronicDuration.output(average_time) if average_time
  end
end
