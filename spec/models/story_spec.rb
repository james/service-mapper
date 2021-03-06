require 'spec_helper'

describe Story do
  before :each do
    @system1 = FactoryGirl.create(:system)
    @system2 = FactoryGirl.create(:system)
    @system3 = FactoryGirl.create(:system)
    @person1 = FactoryGirl.create(:system)
    @person2 = FactoryGirl.create(:system)
    @person3 = FactoryGirl.create(:system)
    @story1 = FactoryGirl.create(:story)
    @story1_stage1 = FactoryGirl.create(:story_stage, :story => @story1, :from => @system1, :to => @person1, :average_time => 20)
    @story1_stage2 = FactoryGirl.create(:story_stage, :story => @story1, :from => @person1, :to => @system2, :average_time => 30)
    @story1_stage3 = FactoryGirl.create(:story_stage, :story => @story1, :from => @system2, :to => @system1)
    @story2 = FactoryGirl.create(:story)
    @story2_stage1 = FactoryGirl.create(:story_stage, :story => @story2, :from => @system1, :to => @system3)
  end

  describe "nodes" do
    it "should only include the nodes that are included in the story" do
      @story1.nodes.should =~ [@system1, @person1, @system2]
    end
  end

  describe "average_time" do
    it "should calculate the total average_times of the stages" do
      @story1.average_time.should == 50
    end
  end
end
